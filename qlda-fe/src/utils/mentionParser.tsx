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
  
  
  const mentionsMap = new Map<string, User>();
  if (options?.mentions && options.mentions.length > 0) {
    options.mentions.forEach((user) => {
      mentionsMap.set(user.id, user);
    });
  }
  
  
  let searchIndex = 0;
  while (searchIndex < content.length) {
    const atIndex = content.indexOf('@', searchIndex);
    if (atIndex === -1) break;
    
    
    if (atIndex > lastIndex) {
      parts.push(content.substring(lastIndex, atIndex));
    }
    
    
    const userIdMatch = content.substring(atIndex).match(/^@\[([a-f0-9-]{36})\]/i);
    if (userIdMatch) {
      const userId = userIdMatch[1];
      const user = mentionsMap.get(userId);
      const displayName = user ? (user.name || user.email) : userId;
      
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
          title={user?.email || userId}
        >
          @{displayName}
        </Text>,
      );
      lastIndex = atIndex + userIdMatch[0].length;
      searchIndex = lastIndex;
      continue;
    }
    
    
    const bracketMatch = content.substring(atIndex).match(/^@\[([^\]]+)\]\(([^)]+)\)/);
    if (bracketMatch) {
      const displayName = bracketMatch[1];
      const userId = bracketMatch[2];
      
      const user = mentionsMap.get(userId);
      const finalDisplayName = user ? (user.name || user.email) : displayName;
      
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
          title={user?.email || userId}
        >
          @{finalDisplayName}
        </Text>,
      );
      lastIndex = atIndex + bracketMatch[0].length;
      searchIndex = lastIndex;
      continue;
    }
    
    
    if (mentionsMap.size > 0) {
      
      const sortedMentions = Array.from(mentionsMap.values()).sort((a, b) => {
        const nameA = a.name || a.email || '';
        const nameB = b.name || b.email || '';
        return nameB.length - nameA.length;
      });
      
      
      let matched = false;
      for (const user of sortedMentions) {
        const userName = user.name || user.email;
        if (!userName) continue;
        
        
        const nameStart = atIndex + 1;
        const nameEnd = nameStart + userName.length;
        
        if (nameEnd <= content.length) {
          const potentialMatch = content.substring(nameStart, nameEnd);
          
          
          if (potentialMatch === userName) {
            
            const nextChar = content[nameEnd];
            if (!nextChar || /[\s\n\r.,!?;:]/.test(nextChar)) {
              
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
        
        parts.push('@');
        lastIndex = atIndex + 1;
        searchIndex = lastIndex;
      }
    } else {
      
      parts.push('@');
      lastIndex = atIndex + 1;
      searchIndex = lastIndex;
    }
  }

  
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : content;
}
