import React, { useState } from 'react';
import { User, LogOut, Trophy, Calendar, MousePointer } from 'lucide-react';

interface UserProfileProps {
  username: string;
  email: string;
  clickCount: number;
  rank: string;
  onLogout: () => void;
}

export default function UserProfile({ username, email, clickCount, rank, onLogout }: UserProfileProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const joinDate = JSON.parse(localStorage.getItem('dontclick-current-user') || '{}').joinDate;
  const memberSince = joinDate ? new Date(joinDate).toLocaleDateString() : 'Today';

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };

  return (
    <div className="absolute top-6 left-6 z-40">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 bg-gray-900/90 hover:bg-gray-800/90 border border-gray-700 hover:border-gray-600 rounded-lg p-3 backdrop-blur-sm transition-all shadow-lg"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <h3 className="font-bold text-white text-sm">{username}</h3>
          <p className="text-xs text-gray-400">{rank}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-white">{clickCount}</div>
          <div className="text-xs text-gray-400">clicks</div>
        </div>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setShowDropdown(false)}
          ></div>
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl shadow-black/50 min-w-[280px] z-40 backdrop-blur-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{username}</h3>
                  <p className="text-sm text-gray-400">{email}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-red-300">Current Rank</span>
                  <Trophy className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white">{rank}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Total Clicks</span>
                </div>
                <span className="text-sm font-bold text-white">{clickCount.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Member Since</span>
                </div>
                <span className="text-sm text-gray-300">{memberSince}</span>
              </div>

              {/* Progress to next rank */}
              {clickCount < 21 && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Next Rank Progress</span>
                    <span className="text-xs text-gray-400">
                      {clickCount}/{
                        clickCount <= 3 ? 4 :
                        clickCount <= 6 ? 7 :
                        clickCount <= 10 ? 11 :
                        clickCount <= 15 ? 16 :
                        clickCount <= 20 ? 21 : 21
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (clickCount / (
                          clickCount <= 3 ? 4 :
                          clickCount <= 6 ? 7 :
                          clickCount <= 10 ? 11 :
                          clickCount <= 15 ? 16 :
                          clickCount <= 20 ? 21 : 21
                        )) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}