# Frontend Development Prompt for Pocket Lawyer

## Project Overview
Pocket Lawyer is an AI-powered legal assistance platform that provides users with instant legal guidance, document review, and consultation services. The frontend needs to implement secure authentication, user account management, API integration, and an intelligent chat bot interface.

## Authentication System Requirements

### 1. Login Page (`/login`)
**Purpose**: Secure user authentication with minimal friction

**Core Features**:
- Email and password input fields with inline validation
- Show/hide password toggle functionality
- Loading states during authentication
- Error handling for invalid credentials
- Remember me option (optional)
- "Forgot Password" link integration
- Social login options (Google, Facebook, X) - styled as "Continue with"

**UI Requirements**:
- Split-screen layout (form left, trust-building visual right)
- Professional legal theme with blue/teal color palette
- Shield and lock icons for security messaging
- Responsive design for mobile/desktop
- Form validation with real-time feedback

**API Integration**:
- POST to `/v1/api/users/login/`
- Handle JWT token storage (access_token in localStorage)
- Redirect to OTP verification on successful login
- Error handling for network failures

### 2. Registration Page (`/register`)
**Purpose**: Convert visitors to users with trust signals

**Core Features**:
- Full name, email, password, confirm password fields
- Password strength indicator with visual feedback
- Terms of service and privacy policy checkboxes
- Email availability checking (real-time validation)
- Social registration options
- Loading states and error handling

**UI Requirements**:
- Same split-screen layout as login
- Progress indicator showing registration steps
- Trust badges: "🔒 End-to-end encrypted", "⚖️ Privacy-first", "⭐ Trusted by X+ users"
- Professional imagery showing secure signup experience

**API Integration**:
- POST to `/v1/api/users/register/`
- Send: `{ email, full_name, password, password2 }`
- Handle duplicate email errors gracefully
- Store initial token and redirect to email verification

### 3. Email Verification (`/verify-otp`)
**Purpose**: Verify user email address for security

**Core Features**:
- 6-digit OTP input with auto-focus management
- Resend code functionality with countdown timer
- Visual feedback for verification status
- Auto-redirect on successful verification

**UI Requirements**:
- Clean centered design with verification icon
- Large, easy-to-read OTP input fields
- Clear messaging about email sent
- Loading states during verification

**API Integration**:
- POST to `/v1/api/users/login/otp/verify/` for login verification
- POST to `/v1/api/users/register/activate/via-otp/` for registration
- Store both access_token and refresh_token on success
- Redirect to chat interface

## Account Management System

### 1. Profile Page (`/profile`)
**Purpose**: User account dashboard and settings

**Core Features**:
- Personal information display (name, email, profile picture)
- Account settings dropdown with:
  - Password management with strength validation
  - Two-factor authentication setup
  - Account status indicators
  - Legal consent overview
- Consultation history with search/filter
- Document management with AI summaries
- Notification preferences

**UI Requirements**:
- Clean dashboard layout with sidebar navigation
- Professional avatar upload functionality
- Expandable sections for different settings
- Visual indicators for account verification status

**API Integration**:
- GET `/v1/api/accounts/me/` for profile data
- PATCH `/v1/api/accounts/me/` for updates
- GET `/v1/api/accounts/me/address/` for address info
- File upload for profile pictures
- Session management for logout

### 2. Settings Management
**Password Change**:
- Current password verification
- New password with confirmation
- Real-time strength validation
- Success/error messaging

**Profile Editing**:
- Inline editing capabilities
- Auto-save functionality
- Validation for all fields
- Undo/cancel options

## Chat Bot System

### 1. Main Chat Interface (`/chat`)
**Purpose**: AI-powered legal consultation interface

**Core Features**:
- Real-time messaging with AI assistant
- Session management (new/load previous conversations)
- File upload for document review
- Voice input capability (future enhancement)
- Message history persistence
- Typing indicators and loading states

**UI Requirements**:
- Split layout: sidebar (sessions) + main chat area
- Professional legal theme with clear message differentiation
- Responsive design for mobile devices
- Accessibility features (keyboard navigation, screen reader support)
- Visual indicators for AI vs user messages

**API Integration**:
- GET `/v1/api/assistant/sessions/` for chat history
- GET `/v1/api/assistant/sessions/{id}/` for session details
- POST `/v1/api/assistant/chat/` for sending messages
- GET `/v1/api/assistant/chat/{requestId}/` for status polling
- WebSocket or polling for real-time updates

### 2. Chat Features
**Message Handling**:
- Support for text and file attachments
- Markdown rendering for formatted responses
- Code block highlighting for legal references
- Timestamp and message status indicators

**Session Management**:
- Create new consultation sessions
- Load and continue previous conversations
- Session renaming and organization
- Search through chat history

**AI Response Handling**:
- Polling mechanism for async responses
- Loading states with contextual messages
- Error handling for failed requests
- Response caching for offline viewing

## Technical Implementation Requirements

### 1. State Management
- Use React Context or Redux for global state
- Authentication state management
- Chat session state persistence
- Error state handling throughout app

### 2. API Service Layer
- Axios interceptors for token management
- Request/response error handling
- Retry logic for failed requests
- API response caching where appropriate

### 3. Security Implementation
- JWT token storage and refresh
- CSRF protection
- Input sanitization
- XSS prevention
- Secure file upload handling

### 4. Performance Optimization
- Code splitting for route-based chunks
- Image optimization and lazy loading
- Message virtualization for long chats
- Debounced search inputs

### 5. Error Handling
- Global error boundaries
- User-friendly error messages
- Fallback UI for failed requests
- Offline mode support

## UI/UX Guidelines

### 1. Design System
- Consistent color palette (blue/teal primary colors)
- Typography scale for readability
- Component library for reusable elements
- Dark mode support (optional)

### 2. Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### 3. Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions
- Adaptive layouts for different screen sizes

### 4. Micro-interactions
- Loading animations and transitions
- Hover states and feedback
- Success/error state animations
- Smooth scrolling and page transitions

## Integration Points

### 1. Backend API Integration
- Authentication endpoints
- Chat assistant endpoints
- Account management endpoints
- File upload endpoints

### 2. Third-party Services
- OAuth providers (Google, Facebook, X)
- Email service integration
- Analytics and monitoring
- Error tracking services

### 3. Browser Features
- Local storage for session persistence
- Service worker for offline support
- Push notifications for important updates
- File system access for document uploads

## Testing Requirements

### 1. Unit Testing
- Component testing with React Testing Library
- Service layer testing
- Utility function testing
- Hook testing

### 2. Integration Testing
- API integration tests
- User flow testing
- Authentication flow testing
- Chat functionality testing

### 3. End-to-End Testing
- Critical user journeys
- Cross-browser testing
- Mobile device testing
- Performance testing

## Deployment Considerations

### 1. Build Optimization
- Bundle size optimization
- Tree shaking for unused code
- Image compression and optimization
- Font optimization

### 2. Environment Configuration
- Development, staging, production environments
- Environment variable management
- API endpoint configuration
- Feature flag implementation

### 3. Monitoring and Analytics
- Error tracking implementation
- Performance monitoring
- User behavior analytics
- A/B testing framework

This comprehensive prompt covers all aspects of frontend development for the Pocket Lawyer platform, ensuring a secure, user-friendly, and professional legal assistance application.
