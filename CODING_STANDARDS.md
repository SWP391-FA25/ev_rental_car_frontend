# 📋 Coding Standards

This document outlines the coding standards and best practices for the EV Rental Car Frontend project.

## 🎯 General Principles

1. **Readability First**: Code should be self-documenting and easy to understand
2. **Consistency**: Follow established patterns throughout the codebase
3. **Maintainability**: Write code that's easy to modify and extend
4. **Performance**: Consider performance implications of your code
5. **Accessibility**: Ensure all components are accessible

## 📝 Code Style

### JavaScript/JSX

#### **Variable Naming**

```jsx
// ✅ Good - Descriptive and clear
const userProfileData = getUserData();
const isUserLoggedIn = checkAuthStatus();
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Bad - Unclear or abbreviated
const data = getUserData();
const loggedIn = checkAuthStatus();
const max = 3;
```

#### **Function Naming**

```jsx
// ✅ Good - Verb-based, descriptive
const handleUserLogin = () => {
  /* ... */
};
const validateEmailAddress = email => {
  /* ... */
};
const fetchUserBookings = async userId => {
  /* ... */
};

// ❌ Bad - Unclear or noun-based
const userLogin = () => {
  /* ... */
};
const email = email => {
  /* ... */
};
const bookings = async userId => {
  /* ... */
};
```

#### **Component Props**

```jsx
// ✅ Good - Destructured with clear names
const UserCard = ({
  user,
  onEdit,
  onDelete,
  isEditable = true,
  className = '',
}) => {
  // Component logic
};

// ❌ Bad - Props object or unclear names
const UserCard = props => {
  // Component logic
};
```

### CSS/Styling

#### **Tailwind Class Organization**

```jsx
// ✅ Good - Grouped logically
<div className="
  flex flex-col items-center justify-center
  w-full max-w-md mx-auto
  p-6 bg-white rounded-lg shadow-md
  hover:shadow-lg transition-shadow duration-200
  sm:flex-row sm:space-x-4
  md:max-w-lg
  lg:max-w-xl
">

// ❌ Bad - Random order
<div className="bg-white flex p-6 sm:flex-row flex-col items-center justify-center rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 sm:space-x-4 w-full max-w-md mx-auto md:max-w-lg lg:max-w-xl">
```

#### **CSS Custom Properties**

```css
/* ✅ Good - Use semantic names */
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --spacing-section: 2rem;
  --border-radius-card: 0.5rem;
}

/* ❌ Bad - Use specific values */
:root {
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  --space-8: 2rem;
  --rounded-lg: 0.5rem;
}
```

## 🏗️ Component Architecture

### **Component Structure**

```jsx
// 1. Imports (React, external, internal, relative)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

import { useUserData } from '../hooks/useUserData';
import { validateEmail } from '../utils/validation';

// 2. PropTypes definitions
// ComponentName.propTypes = { ... };

// 3. Component definition
const ComponentName = ({ prop1, prop2, ...rest }) => {
  // 4. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState(initialValue);
  const { data, loading } = useUserData();

  // 5. Event handlers
  const handleSubmit = event => {
    event.preventDefault();
    // Handle submit logic
  };

  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 7. Render
  return <div className='component-wrapper'>{/* JSX content */}</div>;
};

// 8. PropTypes
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

// 9. Default props
ComponentName.defaultProps = {
  prop2: 0,
};

// 10. Export
export default ComponentName;
```

### **Custom Hooks**

```jsx
// ✅ Good - Clear purpose and return value
const useUserBookings = userId => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getUserBookings(userId);
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  return { bookings, loading, error };
};

// ❌ Bad - Unclear purpose or side effects
const useData = () => {
  const [data, setData] = useState([]);
  // Side effects without clear purpose
  useEffect(() => {
    // Unclear logic
  });
  return data;
};
```

## 🔧 Error Handling

### **Component Error Boundaries**

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='error-fallback'>
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### **API Error Handling**

```jsx
// ✅ Good - Comprehensive error handling
const fetchUserData = async userId => {
  try {
    const response = await apiClient.get(`/users/${userId}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch user data');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);

    // Handle different error types
    if (error.response?.status === 404) {
      throw new Error('User not found');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};
```

## 🧪 Testing Standards

### **Test Structure**

```jsx
describe('ComponentName', () => {
  // Setup
  const defaultProps = {
    prop1: 'test value',
    prop2: 123,
  };

  const renderComponent = (props = {}) => {
    return render(<ComponentName {...defaultProps} {...props} />);
  };

  // Tests
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderComponent();
      expect(screen.getByTestId('component')).toBeInTheDocument();
    });

    it('displays correct content', () => {
      renderComponent();
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events', () => {
      const mockHandler = jest.fn();
      renderComponent({ onClick: mockHandler });

      fireEvent.click(screen.getByRole('button'));
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data gracefully', () => {
      renderComponent({ data: [] });
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });
});
```

## 📱 Responsive Design

### **Mobile-First Approach**

```jsx
// ✅ Good - Mobile-first responsive design
const ResponsiveGrid = () => (
  <div
    className='
    grid grid-cols-1 gap-4
    sm:grid-cols-2 sm:gap-6
    md:grid-cols-3 md:gap-8
    lg:grid-cols-4
  '
  >
    {/* Grid items */}
  </div>
);

// ❌ Bad - Desktop-first approach
const ResponsiveGrid = () => (
  <div
    className='
    grid grid-cols-4 gap-8
    lg:grid-cols-3
    md:grid-cols-2
    sm:grid-cols-1
  '
  >
    {/* Grid items */}
  </div>
);
```

## ♿ Accessibility Standards

### **Semantic HTML**

```jsx
// ✅ Good - Semantic and accessible
<main>
  <header>
    <h1>Page Title</h1>
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/home">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>

  <section aria-labelledby="features-heading">
    <h2 id="features-heading">Features</h2>
    {/* Content */}
  </section>
</main>

// ❌ Bad - Non-semantic and inaccessible
<div>
  <div>
    <div>Page Title</div>
    <div>
      <div><a href="/home">Home</a></div>
      <div><a href="/about">About</a></div>
    </div>
  </div>

  <div>
    <div>Features</div>
    {/* Content */}
  </div>
</div>
```

### **ARIA Attributes**

```jsx
// ✅ Good - Proper ARIA usage
<button
  aria-expanded={isOpen}
  aria-controls="dropdown-menu"
  aria-haspopup="true"
  onClick={toggleDropdown}
>
  Menu
</button>

<ul
  id="dropdown-menu"
  role="menu"
  aria-hidden={!isOpen}
>
  <li role="menuitem">Option 1</li>
  <li role="menuitem">Option 2</li>
</ul>
```

## 🚀 Performance Guidelines

### **Code Splitting**

```jsx
// ✅ Good - Lazy loading for large components
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const UserProfile = lazy(() => import('./UserProfile'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path='/admin' element={<AdminDashboard />} />
      <Route path='/profile' element={<UserProfile />} />
    </Routes>
  </Suspense>
);
```

### **Memoization**

```jsx
// ✅ Good - Memoize expensive calculations
const ExpensiveComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: expensiveCalculation(item),
    }));
  }, [data]);

  return <div>{/* Render processed data */}</div>;
};

// ✅ Good - Memoize callbacks
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <ChildComponent onClick={handleClick} />;
};
```

## 📚 Documentation

### **Component Documentation**

```jsx
/**
 * UserProfile component displays user information and allows editing
 *
 * @component
 * @param {Object} props - Component props
 * @param {User} props.user - User object containing profile information
 * @param {Function} props.onEdit - Callback function called when edit button is clicked
 * @param {Function} props.onDelete - Callback function called when delete button is clicked
 * @param {boolean} [props.isEditable=true] - Whether the profile can be edited
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * <UserProfile
 *   user={userData}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   isEditable={true}
 * />
 */
const UserProfile = ({
  user,
  onEdit,
  onDelete,
  isEditable = true,
  className,
}) => {
  // Component implementation
};
```

---

**Remember: These standards are guidelines. Use your judgment and adapt them to your specific use case while maintaining consistency across the codebase.**
