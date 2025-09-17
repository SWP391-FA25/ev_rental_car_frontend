# 🚗 EV Rental Car Frontend

A modern React application for electric vehicle rental services, built with Vite, Tailwind CSS, and ShadCN UI components.

## 📁 Project Structure

```
src/
├── app/                          # App-level configuration
│   ├── providers/                # Context providers (Auth, Theme, etc.)
│   ├── store/                    # State management (if using Redux/Zustand)
│   └── router/                   # Routing configuration
├── features/                     # Feature-based organization
│   ├── auth/                     # Authentication feature
│   │   ├── components/           # Auth-specific components
│   │   ├── hooks/                # Auth-specific hooks
│   │   ├── services/             # Auth API services
│   │   └── types/                # Auth PropTypes definitions
│   ├── booking/                  # Booking feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── cars/                     # Car management feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── admin/                    # Admin dashboard feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── shared/                   # Shared components and utilities
│       ├── components/           # Reusable UI components
│       ├── hooks/                # Custom hooks
│       ├── services/             # API services
│       ├── types/                # PropTypes definitions
│       └── utils/                # Utility functions
├── components/                   # Legacy components (to be migrated)
│   └── ui/                       # ShadCN UI components
├── context/                      # React Context providers
├── hooks/                        # Global custom hooks
├── lib/                          # External library configurations
├── routes/                       # Route definitions
├── styles/                       # Global styles and CSS
├── views/                        # Page components (legacy)
└── assets/                       # Static assets
```

## 🎯 Coding Conventions

### 📝 File Naming

| Type            | Convention                  | Example                               |
| --------------- | --------------------------- | ------------------------------------- |
| **Components**  | PascalCase                  | `UserProfile.jsx`, `BookingForm.jsx`  |
| **Hooks**       | camelCase with `use` prefix | `useUserData.js`, `useBooking.js`     |
| **Services**    | camelCase                   | `authService.js`, `bookingService.js` |
| **Types**       | PascalCase                  | `UserTypes.js`, `BookingTypes.js`     |
| **Utils**       | camelCase                   | `formatDate.js`, `validateEmail.js`   |
| **Constants**   | UPPER_SNAKE_CASE            | `API_ENDPOINTS.js`, `USER_ROLES.js`   |
| **Pages/Views** | PascalCase                  | `HomePage.jsx`, `AdminDashboard.jsx`  |

### 🏗️ Component Structure

#### **Functional Components**

```jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * UserProfile component displays user information
 * @param {Object} props - Component props
 * @param {string} props.name - User's name
 * @param {string} props.email - User's email
 * @param {Function} props.onEdit - Edit handler function
 */
const UserProfile = ({ name, email, onEdit }) => {
  return (
    <div className='user-profile'>
      <h2>{name}</h2>
      <p>{email}</p>
      <button onClick={onEdit}>Edit Profile</button>
    </div>
  );
};

UserProfile.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default UserProfile;
```

#### **Custom Hooks**

```jsx
import { useState, useEffect } from 'react';

/**
 * Custom hook for managing user data
 * @param {string} userId - User ID
 * @returns {Object} User data and loading state
 */
const useUserData = userId => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data logic
  }, [userId]);

  return { user, loading };
};

export default useUserData;
```

### 🎨 Styling Conventions

#### **Tailwind CSS Classes**

- Use utility classes for styling
- Group related classes together
- Use responsive prefixes consistently

```jsx
// ✅ Good
<div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 sm:flex-row sm:space-x-4">

// ❌ Bad
<div className="flex p-4 bg-white sm:flex-row flex-col items-center justify-center rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 sm:space-x-4">
```

#### **CSS Variables (Theme Support)**

```jsx
// ✅ Use CSS variables for theme support
<Card className="bg-card/95 backdrop-blur-sm shadow-xl border border-border">
  <Label className="text-foreground">Label Text</Label>
</Card>

// ❌ Avoid hardcoded colors
<Card className="bg-white shadow-xl border border-gray-200">
  <Label className="text-gray-700">Label Text</Label>
</Card>
```

### 🔧 Import/Export Conventions

#### **Import Order**

```jsx
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 2. Internal components (absolute imports)
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

// 3. Relative imports
import UserProfile from './UserProfile';
import { useUserData } from '../hooks/useUserData';

// 4. Types and constants
import { UserTypes } from '../types/UserTypes';
import { API_ENDPOINTS } from '../constants/api';
```

#### **Export Conventions**

```jsx
// ✅ Default export for main component
export default UserProfile;

// ✅ Named exports for utilities and hooks
export const formatDate = date => {
  /* ... */
};
export const useUserData = () => {
  /* ... */
};

// ✅ Barrel exports for clean imports
// index.js
export { default as UserProfile } from './UserProfile';
export { default as UserSettings } from './UserSettings';
export * from './types';
```

### 🏷️ PropTypes Conventions

#### **PropTypes Definitions**

```javascript
// types/UserTypes.js
import PropTypes from 'prop-types';

export const UserPropTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['admin', 'user', 'guest']).isRequired,
  createdAt: PropTypes.instanceOf(Date).isRequired,
};

export const UserStatePropTypes = {
  user: PropTypes.shape(UserPropTypes),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};
```

#### **Component Props**

```javascript
import PropTypes from 'prop-types';

const UserProfile = ({ user, onEdit, onDelete, className }) => {
  // Component logic
};

UserProfile.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  className: PropTypes.string,
};

UserProfile.defaultProps = {
  className: '',
};
```

### 🧪 Testing Conventions

#### **Test File Naming**

- Component tests: `ComponentName.test.jsx`
- Hook tests: `useHookName.test.js`
- Service tests: `serviceName.test.js`

#### **Test Structure**

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders user information correctly', () => {
    render(<UserProfile user={mockUser} onEdit={jest.fn()} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByText('Edit Profile'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

### 📱 Responsive Design

#### **Breakpoint Usage**

```jsx
// Mobile-first approach
<div className="
  flex flex-col space-y-4
  sm:flex-row sm:space-y-0 sm:space-x-4
  md:space-x-6
  lg:space-x-8
">
```

#### **Component Responsiveness**

```jsx
const ResponsiveCard = () => (
  <Card
    className='
    w-full max-w-sm mx-auto
    sm:max-w-md
    md:max-w-lg
    lg:max-w-xl
  '
  >
    <CardContent className='p-4 sm:p-6 lg:p-8'>{/* Content */}</CardContent>
  </Card>
);
```

### 🌐 Internationalization (i18n)

#### **Translation Keys**

```jsx
// Use descriptive, hierarchical keys
const t = useTranslation();

// ✅ Good
<h1>{t('pages.home.title')}</h1>
<button>{t('common.buttons.save')}</button>
<p>{t('user.profile.email.label')}</p>

// ❌ Bad
<h1>{t('title')}</h1>
<button>{t('save')}</button>
```

#### **Translation Files Structure**

```json
{
  "pages": {
    "home": {
      "title": "Find Your Perfect Rental Car",
      "subtitle": "Electric vehicles for a sustainable future"
    }
  },
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Edit"
    }
  }
}
```

### 🔒 Security Best Practices

#### **Input Validation**

```jsx
const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleSubmit = formData => {
  if (!validateEmail(formData.email)) {
    setError('Please enter a valid email address');
    return;
  }
  // Process form
};
```

#### **API Security**

```jsx
// Use environment variables for sensitive data
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Always validate responses
const fetchUserData = async userId => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
};
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm run test
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=EV Rental Car
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

1. Follow the coding conventions outlined above
2. Write tests for new features
3. Update documentation as needed
4. Use meaningful commit messages
5. Create pull requests for all changes

## 📝 Commit Message Convention

```
type(scope): description

feat(auth): add user login functionality
fix(booking): resolve date validation issue
docs(readme): update installation instructions
style(components): format code with prettier
refactor(api): improve error handling
test(auth): add login component tests
```

---

**Happy Coding! 🚀**
