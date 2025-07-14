# MovieSquad Frontend 🎬

A modern social platform for movie and TV show enthusiasts built with Next.js. Connect with fellow cinephiles, share reviews, create watchlists, and discover new content together!

## 🚀 Features

### User Authentication & Profiles
- **Sign In/Sign Up**: Secure user authentication with JWT tokens
- **User Profiles**: Customizable profiles with favorite genres and stats
- **Profile Management**: Edit profile information and settings

### Social Features
- **Posts**: Create and share posts about movies and TV shows
- **Comments**: Engage with community through comments
- **Likes**: Like posts to show appreciation
- **Real-time Interactions**: Instant updates for likes and comments

### Content Integration
- **TMDB Integration**: Link posts to movies and TV shows
- **Categories**: Organize posts by type (Reviews, Recommendations, Discussions, etc.)
- **Rich Content**: Support for movie posters and metadata

### Groups (Coming Soon)
- **Movie Groups**: Create and join groups based on interests
- **Group Posts**: Share content within specific communities
- **Group Management**: Admin controls for group moderation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript/React
- **Styling**: Bootstrap 5
- **HTTP Client**: Axios
- **State Management**: React Hooks (useState, useEffect)
- **Authentication**: JWT Tokens with localStorage

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── posts/
│   │   │   ├── AddPostModal.jsx      # Post creation modal
│   │   │   ├── PostCard.jsx          # Individual post display
│   │   │   ├── PostForm.jsx          # Post content rendering
│   │   │   ├── PostLikes.jsx         # Like functionality
│   │   │   ├── PostComments.jsx      # Comment system
│   │   │   └── PostList.jsx          # Posts collection
│   │   ├── profile/
│   │   │   ├── ProfileHeader.jsx     # User profile header
│   │   │   └── ProfileTabs.jsx       # Profile navigation tabs
│   │   ├── Dashboard.jsx             # Main dashboard component
│   │   ├── SignIn.jsx               # Authentication form
│   │   ├── SignUp.jsx               # Registration form
│   │   └── TabsWrapper.jsx          # Reusable tabs component
│   └── pages/
│       └── Profile.jsx              # User profile page
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- MovieSquad Backend running on `http://localhost:3001`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MovieSquadFront/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install axios jwt-decode createContext io socket.io-client bootstrap bootstrap-icons d3 react-router-dom
   ```

3. **Set up environment variables** (if needed)
   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Backend Integration

The frontend is configured to communicate with the MovieSquad backend API:

- **Base URL**: `http://localhost:3001`
- **Authentication**: JWT tokens via `x-auth-token` header
- **Endpoints**:
  - `/api/auth/login` - User authentication
  - `/api/auth/register` - User registration
  - `/api/posts` - Posts CRUD operations
  - `/api/posts/:id/like` - Post likes
  - `/api/posts/:id/comments` - Post comments

### Environment Variables

```env
# Add any environment variables here
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

## 📱 Usage Guide

### Authentication
1. Visit the homepage
2. Sign up for a new account or sign in with existing credentials
3. Your session will be saved locally

### Creating Posts
1. Navigate to your profile
2. Click the "📝 Create Post" button
3. Fill out the post form:
   - Add your thoughts about movies/TV shows
   - Optionally link to TMDB content
   - Select appropriate categories
4. Click "Publish Post"

### Interacting with Posts
- **Like**: Click the thumbs up button
- **Comment**: Click "Comments" and add your thoughts
- **View Details**: All interactions update in real-time

### Profile Management
- **Edit Profile**: Update your information
- **View Stats**: See your posts, friends, and watched content
- **Manage Content**: View and organize your posts

## 🎨 Components Overview

### Core Components

#### `Dashboard.jsx`
Main application component handling authentication state and routing between login/profile views.

#### `ProfileHeader.jsx`
Displays user information, stats, and provides access to post creation and profile management.

#### `AddPostModal.jsx`
Modal component for creating new posts with category selection and content linking.

#### `PostCard.jsx`
Individual post display with integrated likes and comments functionality.

### Authentication Components

#### `SignIn.jsx` & `SignUp.jsx`
Form components with validation, error handling, and success feedback.

## 🔄 Data Flow

1. **Authentication**: JWT tokens stored in localStorage
2. **Posts**: Real-time updates after create/like/comment actions
3. **State Management**: Local component state with prop drilling
4. **API Communication**: Axios with consistent error handling

## 🚧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Code Style

- **Components**: Functional components with hooks
- **Styling**: Bootstrap classes with custom styles
- **Error Handling**: Try-catch blocks with user feedback
- **Loading States**: Spinner indicators for async operations

## 🔐 Security

- **Authentication**: JWT token-based authentication
- **Data Validation**: Client-side form validation
- **Error Handling**: Secure error messages without sensitive data exposure
- **CORS**: Configured for backend communication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is part of an academic assignment for Android Development course.

## 🎯 Roadmap

### Upcoming Features
- [ ] Group functionality
- [ ] Advanced search and filtering
- [ ] Real-time notifications
- [ ] Dark/light theme toggle
- [ ] Mobile responsiveness improvements
- [ ] TMDB API integration for content search
- [ ] Image upload for posts
- [ ] User following system

### Technical Improvements
- [ ] TypeScript migration
- [ ] State management with Redux/Zustand
- [ ] Unit and integration tests
- [ ] Performance optimizations
- [ ] PWA capabilities

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Contact the development team
- Check the backend repository for API-related issues

---

**Built with ❤️ for movie enthusiasts everywhere!** 🍿