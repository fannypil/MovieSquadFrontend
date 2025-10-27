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

### Groups
- **Movie Groups**: Create and join groups based on interests
- **Group Posts**: Share content within specific communities
- **Group Management**: Admin controls for group moderation
- **Invite Members**: Invite friends to join groups, accept/reject invitations from notifications
- **Shared Watchlist**: Collaborate on group watchlists

### Notifications
- **Group Invitations**: Accept or reject group invites directly from notifications
- **Status Persistence**: Invitation status (accepted/rejected) is shown in the UI, even after refresh
- **Real-time Updates**: Notifications for group activity, friend requests, and more

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
## 🖥️ Screenshots & Demo
<img width="1968" height="1442" alt="Image" src="https://github.com/user-attachments/assets/0dec5690-14fd-462a-b70e-82d0c9148864" />


## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- MovieSquad Backend running on `http://localhost:3001`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fannypil/MovieSquadFrontend.git
   cd MovieSquadFront/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install axios jwt-decode createContext io socket.io-client bootstrap bootstrap-icons d3 react-router-dom
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
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

## 📱 Usage Guide

### Authentication
1. Visit the homepage
2. Sign up for a new account or sign in with existing credentials

### Groups
- **Create/Join Groups**: Use the Groups tab or page to find and join groups.
- **Invite Members**: On the group members tab, click "Invite Members" to send invitations.
- **Accept/Reject Invitations**: Go to Notifications, and use the Accept/Reject buttons for group invites. Status is persisted locally.

### Notifications
- **View Notifications**: Access all activity from the Notifications page.
- **Group Invitation Status**: Accept/reject group invites and see status even after refresh.

### Watchlists
- **Manage Watchlists**: Add/remove movies and shows from your personal or group watchlists.

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

## 🔄 Data Flow

- **Authentication**: JWT tokens stored in localStorage
- **Posts/Groups**: Real-time updates after create/like/comment actions
- **Notifications**: Local state and API sync for invitation status

### Code Style

- Functional components with hooks
- Bootstrap classes with custom styles
- Error handling and loading spinners for async operations


## 🔐 Security

- JWT token-based authentication
- Client-side form validation
- Secure error messages

## 📝 License

This project is part of an academic assignment for Android Development course.

---

**Built with ❤️ for movie enthusiasts everywhere!** 🍿