const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');

const textract = new TextractClient({ region: process.env.REGION || 'ap-south-1' });

function parsePayslipText(fullText, lines) {
  const data = {
    employerName: null,
    workerName: null,
    period: null,
    daysWorked: null,
    ratePerDay: null,
    grossPay: null,
    deductions: null,
    netPay: null,
    paymentDate: null,
    minimumWage: 592,
    compliance: 'unknown'
  };

  const employerMatch = fullText.match(/(?:company|employer|contractor)[:\s]+([^\n]+)/i);
  if (employerMatch) {
    data.employerName = employerMatch[1].trim();
  } else if (lines.length > 0) {
    data.employerName = lines[0].text;
  }

  const workerMatch = fullText.match(/(?:employee|worker|name)[:\s]+([^\n]+)/i);
  if (workerMatch) {
    data.workerName = workerMatch[1].trim();
  }

  const periodMatch = fullText.match(/(?:period|month|for)[:\s]+([a-z]+\s+\d{4})/i);
  if (periodMatch) {
    data.period = periodMatch[1].trim();
  }

  const daysMatch = fullText.match(/(?:days|worked)[:\s]*(\d+)/i);
  if (daysMatch) {
    data.daysWorked = parseInt(daysMatch[1]);
  }

  const rateMatch = fullText.match(/(?:rate|daily|per day)[:\s]*₹?\s*(\d+)/i);
  if (rateMatch) {
    data.ratePerDay = parseInt(rateMatch[1]);
  }

  const grossMatch = fullText.match(/(?:gross|total|earnings)[:\s]*₹?\s*(\d+)/i);
  if (grossMatch) {
    data.grossPay = parseInt(grossMatch[1]);
  }

  const deductionsMatch = fullText.match(/(?:deduction|deduct)[:\s]*₹?\s*(\d+)/i);
  if (deductionsMatch) {
    data.deductions = parseInt(deductionsMatch[1]);
  } else {
    data.deductions = 0;
  }

  const netMatch = fullText.match(/(?:net|take home|paid)[:\s]*₹?\s*(\d+)/i);
  if (netMatch) {
    data.netPay = parseInt(netMatch[1]);
  }

  if (data.daysWorked && data.ratePerDay && !data.grossPay) {
    data.grossPay = data.daysWorked * data.ratePerDay;
  }

  if (data.grossPay && data.deductions !== null && !data.netPay) {
    data.netPay = data.grossPay - data.deductions;
  }

  if (data.ratePerDay && data.minimumWage) {
    data.compliance = data.ratePerDay >= data.minimumWage ? 'compliant' : 'non-compliant';
  }

  return data;
}

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { image } = body;

    if (!image) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Missing image data'
        })
      };
    }

    const imageBuffer = Buffer.from(image, 'base64');

    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: imageBuffer
      }
    });

    const response = await textract.send(command);

    const lines = [];
    let fullText = '';
    let totalConfidence = 0;
    let confidenceCount = 0;

    response.Blocks.forEach(block => {
      if (block.BlockType === 'LINE') {
        lines.push({
          text: block.Text,
          confidence: block.Confidence
        });
        fullText += block.Text + '\n';
        totalConfidence += block.Confidence;
        confidenceCount++;
      }
    });

    const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
    const payslipData = parsePayslipText(fullText.trim(), lines);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: {
          ...payslipData,
          rawText: fullText.trim(),
          confidence: averageConfidence / 100,
          extractedAt: new Date().toISOString(),
          source: 'textract'
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
