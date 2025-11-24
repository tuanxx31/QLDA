import React from 'react';
import { Typography } from 'antd';
import type { User } from '@/types/user.type';

const { Text } = Typography;

interface ParseMentionsOptions {
  mentions?: User[];
}

export function parseMentions(content: string, options?: ParseMentionsOptions): React.ReactNode {
  if (!content) return content;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // If we have mentions list, use them to match exact names
  if (options?.mentions && options.mentions.length > 0) {
    // Sort mentions by name length (longest first) to match longer names first
    const sortedMentions = [...options.mentions].sort((a, b) => {
      const nameA = a.name || a.email || '';
      const nameB = b.name || b.email || '';
      return nameB.length - nameA.length;
    });
    
    // Find all @ symbols
    let searchIndex = 0;
    while (searchIndex < content.length) {
      const atIndex = content.indexOf('@', searchIndex);
      if (atIndex === -1) break;
      
      // Add text before @
      if (atIndex > lastIndex) {
        parts.push(content.substring(lastIndex, atIndex));
      }
      
      // First check for format @[name](id)
      const bracketMatch = content.substring(atIndex).match(/^@\[([^\]]+)\]\(([^)]+)\)/);
      if (bracketMatch) {
        const displayName = bracketMatch[1];
        const userId = bracketMatch[2];
        parts.push(
          <Text 
            key={atIndex} 
            strong 
            style={{ 
              color: '#1677ff',
              backgroundColor: '#e6f4ff',
              padding: '2px 6px',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'inline-block',
            }}
            title={userId}
          >
            @{displayName}
          </Text>,
        );
        lastIndex = atIndex + bracketMatch[0].length;
        searchIndex = lastIndex;
        continue;
      }
      
      // Try to match each mention name
      let matched = false;
      for (const user of sortedMentions) {
        const userName = user.name || user.email;
        if (!userName) continue;
        
        // Check if the name appears after @
        const nameStart = atIndex + 1;
        const nameEnd = nameStart + userName.length;
        
        if (nameEnd <= content.length) {
          const potentialMatch = content.substring(nameStart, nameEnd);
          
          // Check if it's an exact match
          if (potentialMatch === userName) {
            // Check if followed by space, newline, punctuation, or end of string
            const nextChar = content[nameEnd];
            if (!nextChar || /[\s\n\r.,!?;:]/.test(nextChar)) {
              // Found a match!
              parts.push(
                <Text 
                  key={atIndex} 
                  strong 
                  style={{ 
                    color: '#1677ff',
                    backgroundColor: '#e6f4ff',
                    padding: '2px 6px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'inline-block',
                  }}
                  title={user.email}
                >
                  @{userName}
                </Text>,
              );
              lastIndex = nameEnd;
              searchIndex = nameEnd;
              matched = true;
              break;
            }
          }
        }
      }
      
      if (!matched) {
        // No match found, just add @ and continue
        parts.push('@');
        lastIndex = atIndex + 1;
        searchIndex = lastIndex;
      }
    }
  } else {
    // Fallback: use regex to match mentions
    // Match both new format @[username](userId) and old format @username
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)|@([^\s\n@]+)/g;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      // Extract display name (either from new or old format)
      const displayName = match[1] || match[3];
      const userId = match[2];
      
      if (displayName) {
        parts.push(
          <Text 
            key={match.index} 
            strong 
            style={{ 
              color: '#1677ff',
              backgroundColor: '#e6f4ff',
              padding: '2px 6px',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'inline-block',
            }}
            title={userId ? `User ID: ${userId}` : undefined}
          >
            @{displayName}
          </Text>,
        );
      } else {
        parts.push('@');
      }
      lastIndex = match.index + match[0].length;
    }
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : content;
}
