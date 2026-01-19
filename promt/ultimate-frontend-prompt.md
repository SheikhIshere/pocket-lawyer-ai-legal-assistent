# Ultimate Frontend Development Prompt - Pocket Lawyer

## Project Overview
Build a professional AI legal assistance platform with React/TypeScript, integrating secure authentication, real-time chat, and subscription management.

## Core Requirements

### 1. Landing Page (/)
**Header**: Dynamic based on auth state
- Unauthenticated: Logo, Nav (Home, Services, About, Contact), "Sign Up" CTA, Login button
- Authenticated: Same nav + "Let's Get Started" CTA + User menu (Profile, Settings, Logout)

**Hero Section**: 
- Headline: "Lawyer in My Pocket - Get Expert Legal Assistance Anytime, Anywhere"
- Sub-headline: AI lawyer interacting with user visual
- CTA: Authenticated → /chat, Unauthenticated → /register

**Sections**: About Us (metrics, impact), Services Overview (4-5 key services), How It Works (3-step visual), Testimonials, Footer (contact, links, social)

### 2. Authentication System

**Login Page (/login)**:
- Split-screen: Form left, Trust visual right (Shield icon, "Secure & Encrypted")
- Fields: Email (Mail icon), Password (Lock icon, show/hide)
- Social: "Continue with Google/Facebook/X"
- API: POST /v1/api/users/login/ → Store token → /verify-otp

**Registration Page (/register)**:
- Same split-screen layout
- Fields: Full Name (User icon), Email, Password, Confirm Password
- Trust badges: 🔒 Encrypted, ⚖️ Privacy-first, ⭐ Trusted
- API: POST /v1/api/users/register/ → /verify-otp

**OTP Verification (/verify-otp)**:
- Centered design, 6-digit input, verification icon
- API: POST /v1/api/users/login/otp/verify/ or /v1/api/users/register/activate/via-otp/
- Success: Store access/refresh tokens → /chat

### 3. Chat System (/chat)

**Layout**: Sidebar (sessions) + Main chat area
- Sidebar: "New Consultation" button, Recent cases list
- Header: "Legal Assistant" with PL logo
- Messages: AI (Bot icon, left) vs User (User icon, right)
- Input: Textarea + Send button, disclaimer banner

**API Integration**:
- GET /v1/api/assistant/sessions/ (chat history)
- POST /v1/api/assistant/chat/ (send message)
- GET /v1/api/assistant/chat/{requestId}/ (poll status)
- Polling: Check every 2s until COMPLETED

### 4. Profile Management (/profile)

**Dashboard Layout**:
- Personal info: Avatar, Name, Email, Phone
- Settings dropdowns: Account, Consultation History, Document Management
- Quick actions: Edit Profile, Change Password, Logout

**Edit Profile**:
- Inline editing, auto-save
- API: PATCH /v1/api/accounts/me/

**Change Password**:
- Current password, New password, Confirm
- Real-time strength validation
- API: Password update endpoint

### 5. Services Page (/services)

**Search Bar**: "Search legal services, documents, or topics..."
**Service Cards**: 20+ legal services with icons and descriptions
**Categories**: AI Consultation, Document Review, Legal Guidance, etc.

### 6. Subscription System

**Plans**: 
- Basic: Free, limited AI chat
- Pro: Paid, full AI + file uploads  
- Premium: Paid + human lawyer access

**Payment Gateway**: Stripe integration, secure form

## Technical Implementation

### State Management
- React Context for auth, chat sessions, user data
- LocalStorage for tokens, session persistence

### API Service Layer
```typescript
// Existing structure maintained
authService: { login, register, verifyOtp }
assistantService: { getSessions, sendMessage, checkStatus }
accountService: { getProfile, updateProfile }
```

### UI Components
- TailwindCSS for styling
- Lucide React icons
- Responsive design (mobile-first)
- Loading states, error handling

### Security
- JWT tokens with refresh mechanism
- Axios interceptors for auth headers
- Input sanitization, XSS prevention

## Design System

### Colors
- Primary: Blue/Teal palette
- Secondary: Slate grays
- Accent: Yellow for warnings

### Typography
- Clean, professional fonts
- Clear hierarchy for legal content

### Components
- Consistent buttons, inputs, cards
- Professional legal theme throughout
- Accessibility: WCAG 2.1 AA compliance

## API Integration Requirements

### Authentication Flow
1. Login/Register → Store token
2. OTP verification → Activate account
3. Auto-redirect to appropriate page

### Chat Flow
1. Load sessions → Display sidebar
2. Send message → Get request ID
3. Poll status → Update when complete
4. Display AI response

### Error Handling
- Network failures: User-friendly messages
- Invalid credentials: Clear error states
- Token expiry: Auto-refresh flow

## Performance Optimization

### Code Splitting
- Route-based chunks
- Lazy load components
- Optimize bundle size

### User Experience
- Smooth transitions
- Loading indicators
- Offline support where possible

## Testing Strategy

### Unit Tests
- Component testing
- Service layer testing
- Hook testing

### Integration Tests
- API integration
- User flows
- Authentication testing

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Mobile responsiveness

## Deployment

### Build Process
- Production optimization
- Environment variables
- API endpoint configuration

### Monitoring
- Error tracking
- Performance metrics
- User analytics

This prompt ensures exact implementation matching your UI/UX designs with proper API integration for the Pocket Lawyer platform.
