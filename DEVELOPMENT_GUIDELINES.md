# 🛠️ Development Guidelines

This document provides practical guidelines for developing features in the EV Rental Car Frontend project.

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+
- npm or yarn
- Git

### **Setup**

```bash
# Clone the repository
git clone <repository-url>
cd ev_rental_car_frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Run tests
npm run test
```

## 📋 Development Workflow

### **1. Feature Development Process**

#### **Step 1: Create Feature Branch**

```bash
git checkout -b feature/user-authentication
git checkout -b fix/booking-validation
git checkout -b refactor/component-structure
```

#### **Step 2: Plan Your Feature**

- [ ] Identify the feature requirements
- [ ] Determine which components need to be created/modified
- [ ] Plan the folder structure
- [ ] Identify any shared components that can be reused

#### **Step 3: Create Feature Structure**

```bash
# For a new feature (e.g., user profile)
mkdir -p src/features/user-profile/{components,hooks,services,types}

# Create main component
touch src/features/user-profile/components/UserProfile.jsx

# Create supporting files
touch src/features/user-profile/hooks/useUserProfile.js
touch src/features/user-profile/services/userProfileService.js
touch src/features/user-profile/types/UserProfileTypes.js
```

#### **Step 4: Develop Following Conventions**

- Follow the coding standards outlined in `CODING_STANDARDS.md`
- Use the component structure template
- Add proper PropTypes and documentation
- Write tests as you develop

#### **Step 5: Test Your Feature**

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Check formatting
npm run format:check
```

#### **Step 6: Create Pull Request**

- Write a descriptive PR title
- Include a detailed description
- Link any related issues
- Request code review from team members

### **2. Component Development Template**

#### **New Component Checklist**

- [ ] Component follows PascalCase naming
- [ ] Props are properly typed with PropTypes
- [ ] Component has JSDoc documentation
- [ ] Component is responsive and accessible
- [ ] Component has proper error handling
- [ ] Component is tested
- [ ] Component follows the established folder structure

#### **Component Template**

```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Internal imports
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Feature-specific imports
import { useCustomHook } from '../hooks/useCustomHook';
import { customService } from '../services/customService';

/**
 * ComponentName - Brief description of what the component does
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Component title
 * @param {Function} props.onAction - Action handler function
 * @param {boolean} [props.isVisible=true] - Whether component is visible
 *
 * @example
 * <ComponentName
 *   title="My Component"
 *   onAction={handleAction}
 *   isVisible={true}
 * />
 */
const ComponentName = ({ title, onAction, isVisible = true }) => {
  // State declarations
  const [state, setState] = useState(initialValue);

  // Custom hooks
  const { data, loading, error } = useCustomHook();

  // Event handlers
  const handleClick = event => {
    event.preventDefault();
    onAction(event);
  };

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Early returns for loading/error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isVisible) return null;

  // Main render
  return (
    <Card className='component-wrapper'>
      <h2>{title}</h2>
      <Button onClick={handleClick}>Action Button</Button>
    </Card>
  );
};

// PropTypes
ComponentName.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
  isVisible: PropTypes.bool,
};

// Default props
ComponentName.defaultProps = {
  isVisible: true,
};

export default ComponentName;
```

### **3. Custom Hook Development**

#### **Hook Template**

```jsx
import { useState, useEffect, useCallback } from 'react';

/**
 * useCustomHook - Brief description of what the hook does
 *
 * @param {string} param1 - Description of param1
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether the hook is enabled
 * @returns {Object} Hook return value
 * @returns {any} returns.data - The data returned by the hook
 * @returns {boolean} returns.loading - Loading state
 * @returns {Error|null} returns.error - Error state
 * @returns {Function} returns.refetch - Function to refetch data
 *
 * @example
 * const { data, loading, error, refetch } = useCustomHook('param1', {
 *   enabled: true
 * });
 */
const useCustomHook = (param1, options = {}) => {
  const { enabled = true } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await customService.fetchData(param1);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [param1, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useCustomHook;
```

### **4. Service Development**

#### **Service Template**

```jsx
import { apiClient } from '@/lib/apiClient';

/**
 * Service for managing user profile operations
 */
class UserProfileService {
  /**
   * Fetch user profile data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile data
   */
  static async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile data
   */
  static async updateUserProfile(userId, profileData) {
    try {
      const response = await apiClient.put(
        `/users/${userId}/profile`,
        profileData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }
}

export default UserProfileService;
```

## 🧪 Testing Guidelines

### **Test File Structure**

```
src/features/user-profile/
├── components/
│   ├── UserProfile.jsx
│   └── UserProfile.test.jsx
├── hooks/
│   ├── useUserProfile.js
│   └── useUserProfile.test.js
└── services/
    ├── userProfileService.js
    └── userProfileService.test.js
```

### **Component Test Template**

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  const defaultProps = {
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(<UserProfile {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders user information correctly', () => {
      renderComponent();

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderComponent({ className: 'custom-class' });

      expect(screen.getByTestId('user-profile')).toHaveClass('custom-class');
    });
  });

  describe('Interactions', () => {
    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();

      renderComponent({ onEdit: mockOnEdit });

      await user.click(screen.getByRole('button', { name: /edit/i }));

      expect(mockOnEdit).toHaveBeenCalledWith(defaultProps.user);
    });

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn();

      renderComponent({ onDelete: mockOnDelete });

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing user data gracefully', () => {
      renderComponent({ user: null });

      expect(screen.getByText('No user data available')).toBeInTheDocument();
    });

    it('disables buttons when loading', () => {
      renderComponent({ loading: true });

      expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    });
  });
});
```

## 🎨 Styling Guidelines

### **Tailwind CSS Best Practices**

#### **Responsive Design**

```jsx
// Mobile-first approach
<div className="
  flex flex-col space-y-4
  sm:flex-row sm:space-y-0 sm:space-x-4
  md:space-x-6
  lg:space-x-8
">
```

#### **Component Styling**

```jsx
// Use CSS variables for theme support
<Card className="
  bg-card/95 backdrop-blur-sm
  border border-border
  shadow-lg hover:shadow-xl
  transition-shadow duration-200
  rounded-lg p-6
">
```

#### **Conditional Styling**

```jsx
// Use clsx for conditional classes
import clsx from 'clsx';

const buttonClasses = clsx(
  'px-4 py-2 rounded-md font-medium transition-colors',
  {
    'bg-primary text-primary-foreground hover:bg-primary/90':
      variant === 'primary',
    'bg-secondary text-secondary-foreground hover:bg-secondary/90':
      variant === 'secondary',
    'opacity-50 cursor-not-allowed': disabled,
  }
);
```

## 🔧 Code Quality Tools

### **Pre-commit Hooks**

```bash
# Install husky for git hooks
npm install -D husky lint-staged

# Add to package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### **VS Code Settings**

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

## 📚 Documentation Standards

### **Component Documentation**

- Every component must have JSDoc comments
- Include @param for all props
- Include @example for complex components
- Include @returns for functions

### **API Documentation**

- Document all service methods
- Include parameter types and descriptions
- Include return value descriptions
- Include error handling information

### **README Updates**

- Update README.md when adding new features
- Include setup instructions for new dependencies
- Document any breaking changes

## 🚨 Common Pitfalls to Avoid

### **1. Import/Export Issues**

```jsx
// ❌ Bad - Default export with named import
import { ComponentName } from './ComponentName';

// ✅ Good - Default export with default import
import ComponentName from './ComponentName';
```

### **2. State Management**

```jsx
// ❌ Bad - Mutating state directly
const [items, setItems] = useState([]);
items.push(newItem); // This won't trigger re-render

// ✅ Good - Creating new state
const [items, setItems] = useState([]);
setItems(prevItems => [...prevItems, newItem]);
```

### **3. Event Handling**

```jsx
// ❌ Bad - Inline functions in JSX
<button onClick={() => handleClick(id)}>Click me</button>;

// ✅ Good - Memoized callback
const handleClick = useCallback(
  id => {
    // Handle click
  },
  [dependencies]
);

<button onClick={() => handleClick(id)}>Click me</button>;
```

## 🎯 Performance Guidelines

### **Code Splitting**

```jsx
// Lazy load heavy components
const AdminDashboard = lazy(() => import('./AdminDashboard'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>;
```

### **Memoization**

```jsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

---

**Remember: These guidelines are living documents. Update them as the project evolves and new patterns emerge! 🚀**
