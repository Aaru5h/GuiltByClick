import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Skull, Heart, Zap, Award, FileText, MessageSquare, X, Trophy, Crown, Target, Flame, User, LogIn } from 'lucide-react';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';

interface MousePosition {
  x: number;
  y: number;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

interface User {
  username: string;
  email: string;
  totalClicks: number;
  joinDate: string;
}

function App() {
  const [clickCount, setClickCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', message: '', type: '' });
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isButtonMoving, setIsButtonMoving] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showConfession, setShowConfession] = useState(false);
  const [confession, setConfession] = useState('');
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first', name: 'First Contact', icon: '🔘', description: 'Clicked once', unlocked: false },
    { id: 'still', name: 'Still Clicking', icon: '😵', description: 'Reached 10 clicks', unlocked: false },
    { id: 'warned', name: 'We Told You Not To', icon: '🫣', description: 'Reached 20 clicks', unlocked: false },
    { id: 'chaos', name: 'Certified Chaos Agent', icon: '💀', description: 'Reached 50 clicks', unlocked: false }
  ]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('guiltbyclick-current-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData);
      
      // Load user's click count
      const userKey = `guiltbyclick-count-${userData.username}`;
      const savedCount = localStorage.getItem(userKey);
      if (savedCount) {
        const count = parseInt(savedCount, 10);
        setClickCount(count);
        updateAchievements(count);
      }
    }
  }, []);

  // Save click count to user-specific localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      const userKey = `guiltbyclick-count-${currentUser.username}`;
      localStorage.setItem(userKey, clickCount.toString());
      
      // Update user's total clicks in users database
      const users = JSON.parse(localStorage.getItem('guiltbyclick-users') || '[]');
      const updatedUsers = users.map((user: User) => 
        user.username === currentUser.username 
          ? { ...user, totalClicks: clickCount }
          : user
      );
      localStorage.setItem('guiltbyclick-users', JSON.stringify(updatedUsers));
      
      updateAchievements(clickCount);
    }
  }, [clickCount, currentUser]);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Move button away from mouse when clickCount >= 6
  useEffect(() => {
    if (clickCount >= 6 && clickCount < 10 && buttonRef.current && containerRef.current) {
      const button = buttonRef.current;
      const container = containerRef.current;
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(mousePos.x - buttonCenterX, 2) + Math.pow(mousePos.y - buttonCenterY, 2)
      );
      
      if (distance < 150) {
        setIsButtonMoving(true);
        const angle = Math.atan2(buttonCenterY - mousePos.y, buttonCenterX - mousePos.x);
        const moveDistance = 100;
        
        let newX = Math.cos(angle) * moveDistance;
        let newY = Math.sin(angle) * moveDistance;
        
        // Keep button within container bounds
        const maxX = containerRect.width / 2 - buttonRect.width / 2;
        const maxY = containerRect.height / 2 - buttonRect.height / 2;
        
        newX = Math.max(-maxX, Math.min(maxX, newX));
        newY = Math.max(-maxY, Math.min(maxY, newY));
        
        setButtonPosition({ x: newX, y: newY });
        
        setTimeout(() => setIsButtonMoving(false), 300);
      }
    }
  }, [mousePos, clickCount]);

  const updateAchievements = (count: number) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => {
        const shouldUnlock = 
          (achievement.id === 'first' && count >= 1) ||
          (achievement.id === 'still' && count >= 10) ||
          (achievement.id === 'warned' && count >= 20) ||
          (achievement.id === 'chaos' && count >= 50);
        
        if (shouldUnlock && !achievement.unlocked) {
          // Show new achievement popup
          setTimeout(() => {
            setNewAchievement(achievement);
            setTimeout(() => setNewAchievement(null), 3000);
          }, 500);
          
          return { ...achievement, unlocked: true };
        }
        return achievement;
      });
      return updated;
    });
  };

  const getRankTitle = (count: number): string => {
    if (count <= 3) return "Curious Kitten";
    if (count <= 6) return "Button Botherer";
    if (count <= 10) return "Click Connoisseur";
    if (count <= 15) return "Certified Clicker™";
    if (count <= 20) return "Glutton for Clicks";
    return "Destroyer of Self-Control";
  };

  const getRankIcon = (count: number): React.ReactNode => {
    if (count <= 3) return <Target className="w-4 h-4 text-blue-400" />;
    if (count <= 6) return <Zap className="w-4 h-4 text-yellow-400" />;
    if (count <= 10) return <Award className="w-4 h-4 text-purple-400" />;
    if (count <= 15) return <Crown className="w-4 h-4 text-orange-400" />;
    if (count <= 20) return <Trophy className="w-4 h-4 text-red-400" />;
    return <Flame className="w-4 h-4 text-red-500" />;
  };

  const getRealLeaderboard = () => {
    const users = JSON.parse(localStorage.getItem('guiltbyclick-users') || '[]');
    return users
      .map((user: User) => ({
        name: user.username,
        clicks: user.totalClicks || 0,
        rank: getRankTitle(user.totalClicks || 0),
        isCurrentUser: currentUser?.username === user.username
      }))
      .sort((a: any, b: any) => b.clicks - a.clicks)
      .slice(0, 10); // Top 10
  };

  const handleLogin = (username: string, email: string) => {
    const userData = { username, email, totalClicks: clickCount, joinDate: new Date().toISOString() };
    setCurrentUser(userData);
    
    // Load user's existing click count
    const userKey = `guiltbyclick-count-${username}`;
    const savedCount = localStorage.getItem(userKey);
    if (savedCount) {
      setClickCount(parseInt(savedCount, 10));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('guiltbyclick-current-user');
    setCurrentUser(null);
    setClickCount(0);
    setAchievements(prev => prev.map(a => ({ ...a, unlocked: false })));
  };

  const playClickSound = () => {
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sounds for different click counts
    const frequencies = [440, 330, 550, 220, 660, 110, 880];
    oscillator.frequency.setValueAtTime(frequencies[clickCount % frequencies.length], audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const showPopupMessage = (title: string, message: string, type: string = 'default') => {
    setPopupContent({ title, message, type });
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleClick = () => {
    // Require login to click
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    playClickSound();
    setIsAnimating(true);
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // Handle specific click reactions
    switch (newCount) {
      case 1:
        showPopupMessage("First Click", "You clicked. That's on you.", "warning");
        break;
      case 2:
        showPopupMessage("Shame Protocol", "Initiating shame protocol...", "error");
        break;
      case 3:
        showPopupMessage("404 Error", "404: Self-Control Not Found", "error");
        break;
      case 4:
        showPopupMessage("CAPTCHA", "Are you a human with impulse issues? ✓ Yes ✓ Definitely", "captcha");
        break;
      case 5:
        showPopupMessage("Resume Generated", "Things I Shouldn't Have Clicked - A Comprehensive List", "resume");
        break;
      case 10:
        setShowCertificate(true);
        showPopupMessage("Achievement Unlocked!", "Certified Button Addict™", "certificate");
        break;
      case 15:
        showPopupMessage("Welcome to the Club", "You've reached the final level of button addiction!", "welcome");
        break;
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getRoastMessage = () => {
    const roasts = [
      "Your click personality: Curious Disaster",
      "Diagnosis: Chronic Button Syndrome",
      "You have the impulse control of a caffeinated squirrel",
      "Your clicking style: Chaotic Neutral",
      "Warning: Professional Button Botherer"
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  };

  const getContent = () => {
    if (!currentUser) {
      return {
        icon: <User className="w-12 h-12 text-blue-500 mb-6" />,
        title: "LOGIN REQUIRED",
        subtitle: "You must be logged in to join the guilt club.",
        buttonText: "LOGIN TO START CLICKING",
        message: "Create an account to track your clicks and compete on the leaderboard!"
      };
    }

    switch (clickCount) {
      case 0:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-red-500 mb-6" />,
          title: "DANGER ZONE",
          subtitle: "This button must not be clicked. You've been warned.",
          buttonText: "DO NOT CLICK THIS BUTTON",
          message: "Seriously, don't even think about it."
        };
      
      case 1:
        return {
          icon: <Skull className="w-12 h-12 text-red-500 mb-6" />,
          title: "You clicked. That's on you.",
          subtitle: "We warned you, but here we are.",
          buttonText: "CLICK AGAIN (IF YOU DARE)",
          message: "One click down, infinity to go. This is your life now."
        };
      
      case 2:
        return {
          icon: <Zap className="w-12 h-12 text-red-500 mb-6 animate-pulse" />,
          title: "Shame Protocol Activated",
          subtitle: "Your ancestors are disappointed.",
          buttonText: "THIRD TIME'S THE CHARM?",
          message: "The shame glow is now permanently attached to your cursor."
        };
      
      case 3:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-red-500 mb-6" />,
          title: "404: Self-Control Not Found",
          subtitle: "Have you tried turning your impulses off and on again?",
          buttonText: "CLICK FOR TECHNICAL SUPPORT",
          message: "Error Code: YOLO-404. Please contact your nearest therapist."
        };
      
      case 4:
        return {
          icon: <Heart className="w-12 h-12 text-red-500 mb-6" />,
          title: "CAPTCHA Failed",
          subtitle: "Confirmed: You are human with impulse issues.",
          buttonText: "GENERATE MY RESUME",
          message: "Congratulations! You've passed the 'Are you easily manipulated?' test with flying colors."
        };
      
      case 5:
        return {
          icon: <FileText className="w-12 h-12 text-red-500 mb-6" />,
          title: "Resume: Things I Shouldn't Have Clicked",
          subtitle: getRoastMessage(),
          buttonText: "ADD TO MY COLLECTION",
          message: "Skills: Professional Procrastination, Expert Level Curiosity, Advanced Button Harassment"
        };

      case 6:
      case 7:
      case 8:
      case 9:
        return {
          icon: <Zap className="w-12 h-12 text-red-500 mb-6 animate-bounce" />,
          title: "Button Evasion Mode: ACTIVE",
          subtitle: "Try to catch me if you can!",
          buttonText: "CLICK ME... IF YOU CAN",
          message: "The button has developed trust issues and is now avoiding you. This is what happens when you abuse buttons."
        };
      
      case 10:
        return {
          icon: <Award className="w-12 h-12 text-yellow-500 mb-6" />,
          title: "CERTIFIED BUTTON ADDICT™",
          subtitle: "Achievement Unlocked: Professional Clicker",
          buttonText: "CLICK FOR WORLD DOMINATION",
          message: "You've earned your place in the Button Addicts Hall of Fame. Your certificate is ready for download."
        };
      
      default:
        return {
          icon: <Skull className="w-12 h-12 text-red-500 mb-6" />,
          title: clickCount >= 15 ? "Welcome to the Club" : "Soul Contract Activated",
          subtitle: clickCount >= 15 ? "You've reached the final level!" : `Click #${clickCount} - You're officially addicted`,
          buttonText: clickCount >= 15 ? "ETERNAL CLICKING AWAITS" : "SIGN YOUR SOUL AWAY",
          message: clickCount >= 15 ? 
            "Congratulations! You've joined the elite ranks of the Chronic Clickers Club. Your dedication to button abuse is truly inspiring." :
            "Your soul is now property of GuiltByClick. Terms and conditions apply, soul may be returned upon request, batteries not included."
        };
    }
  };

  const content = getContent();

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-900/10"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Built with Bolt.new Badge */}
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group transition-all duration-300 hover:scale-105"
        title="Built with Bolt.new"
      >
        <img
          src="/boltWhite.png"
          alt="Built with Bolt.new"
          className="w-16 h-16 drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
        />
      </a>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      {/* User Profile or Login Button */}
      {currentUser ? (
        <UserProfile 
          username={currentUser.username}
          email={currentUser.email}
          clickCount={clickCount}
          rank={getRankTitle(clickCount)}
          onLogout={handleLogout}
        />
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          className="absolute top-6 left-6 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25 z-40"
        >
          <LogIn className="w-4 h-4" />
          Login / Sign Up
        </button>
      )}

      {/* Leaderboard Button - Top Right */}
      <button
        onClick={() => setShowLeaderboard(true)}
        className="absolute top-6 right-6 bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-yellow-500/25 z-40"
      >
        <Trophy className="w-4 h-4" />
        Leaderboard
      </button>

      {/* Achievement Notifications */}
      {newAchievement && (
        <div className="fixed top-20 right-6 bg-green-600 border-2 border-green-400 rounded-lg p-4 z-50 animate-bounce shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{newAchievement.icon}</span>
            <div>
              <h3 className="font-bold text-white">Achievement Unlocked!</h3>
              <p className="text-sm text-green-100">{newAchievement.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Display - Bottom Left */}
      {achievements.some(a => a.unlocked) && currentUser && (
        <div className="absolute bottom-6 left-6 bg-gray-900/80 border border-gray-700 rounded-lg p-3 backdrop-blur-sm max-w-xs shadow-lg">
          <h3 className="text-sm font-bold mb-2 text-yellow-400">🏆 Achievements</h3>
          <div className="grid grid-cols-2 gap-2">
            {achievements.filter(a => a.unlocked).map(achievement => (
              <div key={achievement.id} className="flex items-center gap-1 text-xs">
                <span>{achievement.icon}</span>
                <span className="text-gray-300 truncate">{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-xl p-6 max-w-md w-full shadow-2xl shadow-yellow-900/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Global Leaderboard
              </h2>
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-2">
              {getRealLeaderboard().length > 0 ? (
                getRealLeaderboard().map((player: any, index: number) => (
                  <div 
                    key={player.name}
                    className={`
                      flex justify-between items-center p-3 rounded-lg transition-all
                      ${player.isCurrentUser ? 'bg-blue-900/50 border border-blue-500 shadow-lg' : 'bg-gray-800/50 hover:bg-gray-700/50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`
                        text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center text-center
                        ${index === 0 ? 'bg-yellow-500 text-black' : 
                          index === 1 ? 'bg-gray-300 text-black' : 
                          index === 2 ? 'bg-orange-400 text-black' : 'bg-gray-700 text-gray-300'}
                      `}>
                        #{index + 1}
                      </span>
                      <div>
                        <div className={`font-semibold ${player.isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                          {player.name} {player.isCurrentUser && '(You)'}
                        </div>
                        <div className="text-xs text-gray-400">{player.rank}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{player.clicks.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">clicks</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No players yet!</p>
                  <p className="text-sm">Be the first to join the leaderboard.</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-500">
              Rankings update in real-time
              <br />
              <span className="text-xs">Sign up to claim your spot!</span>
            </div>
          </div>
        </div>
      )}

      {/* Popup Messages */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`
            bg-gray-900 border-2 p-6 rounded-xl max-w-md mx-4 text-center shadow-2xl
            ${popupContent.type === 'error' ? 'border-red-500 shadow-red-900/50' : 
              popupContent.type === 'warning' ? 'border-yellow-500 shadow-yellow-900/50' :
              popupContent.type === 'certificate' ? 'border-yellow-500 shadow-yellow-900/50' :
              'border-gray-600 shadow-black/50'}
          `}>
            <h3 className="text-xl font-bold mb-2">{popupContent.title}</h3>
            <p className="text-gray-300">{popupContent.message}</p>
            {popupContent.type === 'captcha' && (
              <div className="mt-4 p-3 bg-gray-800 rounded border">
                <p className="text-sm text-gray-400 mb-2">Please select all that apply:</p>
                <div className="text-left space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" checked readOnly className="mr-2" />
                    <span className="text-sm">I have impulse control issues</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked readOnly className="mr-2" />
                    <span className="text-sm">I click things I shouldn't</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked readOnly className="mr-2" />
                    <span className="text-sm">I am easily manipulated by buttons</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 text-black p-8 rounded-xl max-w-lg w-full border-4 border-yellow-500 relative shadow-2xl">
            <button 
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-black hover:text-red-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <Award className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">CERTIFICATE OF ACHIEVEMENT</h2>
              <div className="border-t-2 border-b-2 border-yellow-600 py-4 my-4">
                <h3 className="text-xl font-semibold">CERTIFIED BUTTON ADDICT™</h3>
                <p className="text-sm mt-2">This certifies that <strong>{currentUser?.username}</strong> has demonstrated</p>
                <p className="text-sm">exceptional dedication to button clicking</p>
              </div>
              <p className="text-sm">Awarded on: {new Date().toLocaleDateString()}</p>
              <p className="text-sm">Click Count: {clickCount}</p>
              <p className="text-sm">Current Rank: {getRankTitle(clickCount)}</p>
              <div className="mt-4 text-xs text-gray-600">
                <p>Certified by GuiltByClick</p>
                <p>Valid for life (or until you develop self-control)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Properly Centered */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {content.icon}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
          {content.title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-light text-gray-300 mb-8">
          {content.subtitle}
        </p>

        {/* The Forbidden Button - FIXED POSITIONING */}
        <div className="mb-8 relative flex justify-center">
          <button
            ref={buttonRef}
            onClick={handleClick}
            className={`
              relative group px-8 py-4 md:px-12 md:py-6 
              ${!currentUser ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' : 'bg-red-600 hover:bg-red-700 active:bg-red-800'}
              text-white font-bold text-lg md:text-xl
              rounded-lg shadow-2xl 
              ${!currentUser ? 'shadow-blue-900/50 hover:shadow-blue-500/50' : 'shadow-red-900/50 hover:shadow-red-500/50'}
              transition-all duration-300 ease-in-out
              hover:scale-105 active:scale-95
              border-2 ${!currentUser ? 'border-blue-500 hover:border-blue-400' : 'border-red-500 hover:border-red-400'}
              ${isAnimating ? 'animate-pulse scale-110' : ''}
              ${clickCount === 2 ? 'shadow-red-500 shadow-2xl animate-pulse' : ''}
              ${isButtonMoving ? 'transition-transform duration-300' : ''}
            `}
            style={{
              transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${!currentUser ? 'from-blue-600 to-blue-700' : 'from-red-600 to-red-700'} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <span className="relative z-10 tracking-wide">
              {content.buttonText}
            </span>
            
            {/* Enhanced glow effect for shame protocol */}
            <div className={`
              absolute inset-0 rounded-lg bg-red-500 blur-xl transition-opacity duration-300
              ${clickCount === 2 ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'}
            `}></div>
          </button>
        </div>

        {/* Message */}
        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-6">
          {content.message}
        </p>

        {/* AI Roast after 5 clicks */}
        {clickCount >= 5 && currentUser && (
          <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500 rounded-lg max-w-2xl mx-auto">
            <p className="text-purple-300 text-sm font-semibold">
              🤖 AI Analysis: {getRoastMessage()}
            </p>
          </div>
        )}

        {/* Click Confession Box */}
        {clickCount >= 3 && currentUser && (
          <div className="mb-6">
            <button
              onClick={() => setShowConfession(!showConfession)}
              className="text-blue-400 hover:text-blue-300 text-sm underline mb-2 flex items-center mx-auto transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Click Confession Box
            </button>
            
            {showConfession && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 max-w-md mx-auto">
                <textarea
                  value={confession}
                  onChange={(e) => setConfession(e.target.value)}
                  placeholder="Why did you click? Confess your sins..."
                  className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 text-sm resize-none focus:border-red-500 focus:outline-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your confession will be judged by the Button Gods
                </p>
              </div>
            )}
          </div>
        )}

        {/* Click counter */}
        {clickCount > 0 && currentUser && (
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              Click Count: <span className="text-red-400 font-bold">{clickCount}</span>
            </p>
            {clickCount >= 6 && clickCount < 10 && (
              <p className="text-xs text-yellow-400 mt-1">
                🏃‍♂️ Button is now avoiding you!
              </p>
            )}
          </div>
        )}

        {/* Achievement badges */}
        {currentUser && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {clickCount >= 1 && (
              <span className="px-3 py-1 bg-red-900/30 border border-red-700 rounded-full text-xs font-medium">
                First Click Survivor
              </span>
            )}
            {clickCount >= 5 && (
              <span className="px-3 py-1 bg-purple-900/30 border border-purple-700 rounded-full text-xs font-medium">
                Resume Generated
              </span>
            )}
            {clickCount >= 10 && (
              <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-700 rounded-full text-xs font-medium">
                Certified Addict™
              </span>
            )}
            {clickCount >= 15 && (
              <span className="px-3 py-1 bg-green-900/30 border border-green-700 rounded-full text-xs font-medium">
                Club Member
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom signature */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <p className="text-xs text-gray-600">
          GuiltByClick - Where curiosity meets regret
        </p>
      </div>
    </div>
  );
}

export default App;