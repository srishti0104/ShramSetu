/**
 * Role Selection Component
 * 
 * @fileoverview Worker/Contractor role selection during onboarding
 */

import { useState } from 'react';
import './RoleSelection.css';

/**
 * @typedef {'worker' | 'contractor'} UserRole
 */

const ROLES = [
  {
    id: 'worker',
    name: 'Worker',
    description: 'I am looking for work opportunities',
    features: [
      'Find jobs near you',
      'Track your wages',
      'Mark attendance with TOTP',
      'Build your trust profile'
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <path d="M32 4C23.163 4 16 11.163 16 20c0 8.837 7.163 16 16 16s16-7.163 16-16c0-8.837-7.163-16-16-16zm0 8c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zM8 52c0-13.255 10.745-24 24-24s24 10.745 24 24v8H8v-8z"/>
      </svg>
    )
  },
  {
    id: 'contractor',
    name: 'Contractor',
    description: 'I need to hire workers',
    features: [
      'Post job opportunities',
      'Manage worker payments',
      'Generate attendance codes',
      'Rate and review workers'
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <path d="M32 4C23.163 4 16 11.163 16 20c0 8.837 7.163 16 16 16s16-7.163 16-16c0-8.837-7.163-16-16-16zm0 8c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zM8 52c0-13.255 10.745-24 24-24s24 10.745 24 24v8H8v-8z"/>
        <path d="M48 16h8v8h-8zM48 28h8v8h-8zM48 40h8v8h-8z"/>
      </svg>
    )
  }
];

/**
 * Role Selection Component
 * @param {Object} props
 * @param {(role: UserRole) => void} props.onRoleSelect - Callback when role is selected
 * @param {UserRole} [props.selectedRole] - Currently selected role
 * @param {string} [props.className] - Additional CSS classes
 */
export default function RoleSelection({ onRoleSelect, selectedRole, className = '' }) {
  const [selected, setSelected] = useState(selectedRole || null);

  /**
   * Handle role selection
   * @param {UserRole} roleId
   */
  const handleSelect = (roleId) => {
    setSelected(roleId);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (selected) {
      onRoleSelect(selected);
    }
  };

  return (
    <div className={`role-selection ${className}`}>
      <h2 className="role-selection__title">Choose Your Role</h2>
      
      <p className="role-selection__description">
        Select how you want to use Shramik-Setu
      </p>

      <div className="role-selection__options" role="radiogroup" aria-label="User role selection">
        {ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            role="radio"
            aria-checked={selected === role.id}
            className={`role-selection__option ${
              selected === role.id ? 'role-selection__option--selected' : ''
            }`}
            onClick={() => handleSelect(role.id)}
          >
            <div className="role-selection__icon" aria-hidden="true">
              {role.icon}
            </div>
            
            <h3 className="role-selection__role-name">{role.name}</h3>
            
            <p className="role-selection__role-description">{role.description}</p>
            
            <ul className="role-selection__features">
              {role.features.map((feature, index) => (
                <li key={index} className="role-selection__feature">
                  <svg className="role-selection__feature-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {selected === role.id && (
              <span className="role-selection__checkmark" aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected}
        className="role-selection__submit"
      >
        Continue as {selected ? ROLES.find(r => r.id === selected)?.name : '...'}
      </button>
    </div>
  );
}
