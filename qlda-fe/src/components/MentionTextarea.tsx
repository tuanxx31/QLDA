import { Input, Spin } from 'antd';
import { useState, useRef, useEffect, useMemo, KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectMemberService } from '@/services/project.services';
import type { ProjectMember } from '@/types/project.type';

const { TextArea } = Input;

interface MentionUser {
  id: string;
  name: string;
  email: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  projectId: string;
  placeholder?: string;
  autoSize?: { minRows: number; maxRows: number };
  onPressEnter?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  style?: React.CSSProperties;
  onMentionsChange?: (mentionIds: string[]) => void;
  currentUserId?: string;
}

export default function MentionTextarea({
  value,
  onChange,
  projectId,
  placeholder,
  autoSize,
  onPressEnter,
  style,
  onMentionsChange,
  currentUserId,
}: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<any>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch project members
  const { data: projectMembers = [], isLoading } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => projectMemberService.getProjectMebers(projectId),
    enabled: !!projectId,
  });

  // Convert to MentionUser format and filter out current user
  const users: MentionUser[] = projectMembers
    .map((pm: ProjectMember) => ({
      id: pm.user.id,
      name: pm.user.name || pm.user.email,
      email: pm.user.email,
    }))
    .filter((user) => user.id !== currentUserId); // Filter out current user

  // Normalize Vietnamese text for better matching
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  };

  // Filter suggestions with better matching (startsWith > includes)
  const filteredUsers = useMemo(() => {
    if (!mentionQuery.trim()) {
      return users;
    }

    const normalizedQuery = normalizeText(mentionQuery);
    const queryLower = mentionQuery.toLowerCase();

    // Score users based on match quality
    const scoredUsers = users
      .map((user) => {
        const nameLower = user.name.toLowerCase();
        const emailLower = user.email.toLowerCase();
        const nameNormalized = normalizeText(user.name);
        const emailNormalized = normalizeText(user.email);

        let score = 0;

        // Highest priority: name starts with query
        if (nameLower.startsWith(queryLower) || nameNormalized.startsWith(normalizedQuery)) {
          score = 100;
        }
        // High priority: email starts with query
        else if (emailLower.startsWith(queryLower) || emailNormalized.startsWith(normalizedQuery)) {
          score = 80;
        }
        // Medium priority: name includes query
        else if (nameLower.includes(queryLower) || nameNormalized.includes(normalizedQuery)) {
          score = 50;
        }
        // Low priority: email includes query
        else if (emailLower.includes(queryLower) || emailNormalized.includes(normalizedQuery)) {
          score = 30;
        }

        return { user, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.user);

    return scoredUsers;
  }, [users, mentionQuery]);

  // Extract mention IDs from current value
  // Only supports @name format (formatted @[name](id) will be converted to @name when editing)
  useEffect(() => {
    const ids: string[] = [];
    
    // Extract from plain @name format by matching with users
    // Match @name where name can contain spaces and Vietnamese characters
    // Pattern: @ followed by name (can contain spaces, ends at space, punctuation, or end of string)
    const plainMentionRegex = /@([^\s@\n]+(?:\s+[^\s@\n]+)*)/g;
    let plainMatch;
    while ((plainMatch = plainMentionRegex.exec(value)) !== null) {
      const mentionName = plainMatch[1].trim();
      
      if (!mentionName) continue;
      
      // Find user by name (exact match)
      const user = users.find(
        (u) => (u.name === mentionName || u.email === mentionName) && !ids.includes(u.id)
      );
      if (user) {
        ids.push(user.id);
      }
    }
    
    onMentionsChange?.(ids);
  }, [value, users, onMentionsChange]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);

    // Get text before cursor
    const textBeforeCursor = newValue.substring(0, cursorPos);
    
    // Find the last '@' before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      // No '@' found, hide suggestions
      setShowSuggestions(false);
      setMentionQuery('');
      setMentionStartPos(null);
      return;
    }

    // Get text after '@'
    const queryText = textBeforeCursor.substring(lastAtIndex + 1);
    
    // Check if there's a space, newline, or special character after '@' (which would end the mention)
    // Also check if the mention is too long
    const hasEndingChar = /[\s\n@]/.test(queryText);
    const isTooLong = queryText.length > 50;
    
    if (!hasEndingChar && !isTooLong) {
      // Active mention detected
      setMentionQuery(queryText);
      setMentionStartPos(lastAtIndex);
      setShowSuggestions(true);
      setSelectedIndex(0);
      
      // Calculate cursor position for dropdown
      calculateDropdownPosition(e.target, cursorPos);
    } else {
      // Mention ended or invalid
      setShowSuggestions(false);
      setMentionQuery('');
      setMentionStartPos(null);
    }
  };

  // Calculate dropdown position
  const calculateDropdownPosition = (textarea: HTMLTextAreaElement, position: number) => {
    try {
      // Get textarea position
      const textareaRect = textarea.getBoundingClientRect();
      
      // Create a temporary element to measure text position
      const measureDiv = document.createElement('div');
      const computedStyle = window.getComputedStyle(textarea);
      
      // Copy relevant styles
      measureDiv.style.position = 'absolute';
      measureDiv.style.visibility = 'hidden';
      measureDiv.style.whiteSpace = 'pre-wrap';
      measureDiv.style.wordWrap = 'break-word';
      measureDiv.style.font = computedStyle.font;
      measureDiv.style.padding = computedStyle.padding;
      measureDiv.style.width = computedStyle.width;
      measureDiv.style.lineHeight = computedStyle.lineHeight;
      measureDiv.style.border = computedStyle.border;
      measureDiv.style.boxSizing = computedStyle.boxSizing;
      
      // Set text content up to cursor
      const textBeforeCursor = textarea.value.substring(0, position);
      measureDiv.textContent = textBeforeCursor;
      
      document.body.appendChild(measureDiv);
      
      // Create a span to mark cursor position
      const cursorSpan = document.createElement('span');
      cursorSpan.textContent = '|';
      measureDiv.appendChild(cursorSpan);
      
      // Get position
      const measureRect = measureDiv.getBoundingClientRect();
      const cursorSpanRect = cursorSpan.getBoundingClientRect();
      
      // Calculate relative position
      const relativeTop = cursorSpanRect.top - measureRect.top + textarea.scrollTop;
      const relativeLeft = cursorSpanRect.left - measureRect.left;
      
      setCursorPosition({
        top: relativeTop,
        left: relativeLeft,
      });
      
      document.body.removeChild(measureDiv);
    } catch (error) {
      // Fallback: position dropdown at top-left of textarea
      setCursorPosition({
        top: 24,
        left: 0,
      });
    }
  };

  // Handle user selection
  const selectUser = (user: MentionUser) => {
    if (mentionStartPos === null) return;

    const textarea = textareaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const currentValue = value;
    const cursorPos = textarea.selectionStart || currentValue.length;
    
    // Get text before '@' and after cursor
    const before = currentValue.substring(0, mentionStartPos);
    const after = currentValue.substring(cursorPos);
    
    // Format: @name (simple format for display, will be formatted to @[name](id) when submit)
    const mention = `@${user.name}`;
    const newValue = before + mention + ' ' + after;
    
    onChange(newValue);
    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStartPos(null);
    
    // Set cursor position after mention and space
    setTimeout(() => {
      const newPos = before.length + mention.length + 1;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        selectUser(filteredUsers[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (onPressEnter && e.key === 'Enter') {
      onPressEnter(e);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, showSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSuggestions &&
        textareaRef.current &&
        suggestionsRef.current &&
        !textareaRef.current.resizableTextArea?.textArea?.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setMentionQuery('');
        setMentionStartPos(null);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  return (
    <div style={{ position: 'relative' }}>
      <TextArea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoSize={autoSize}
        style={style}
        spellCheck={false}
      />
      
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: cursorPosition.top + 24,
            left: Math.max(0, cursorPosition.left),
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 1000,
            minWidth: 200,
            maxWidth: 300,
          }}
        >
          {isLoading ? (
            <div style={{ padding: 12, textAlign: 'center' }}>
              <Spin size="small" />
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <div
                key={user.id}
                onClick={() => selectUser(user)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: index === selectedIndex ? '#e6f7ff' : 'transparent',
                  transition: 'background-color 0.2s',
                  borderBottom: index < filteredUsers.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{ fontWeight: 500, fontSize: 14, color: '#262626' }}>{user.name}</div>
                {user.name !== user.email && (
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{user.email}</div>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: 12, textAlign: 'center', color: '#8c8c8c', fontSize: 13 }}>
              Không tìm thấy thành viên
            </div>
          )}
        </div>
      )}
    </div>
  );
}

