import React from 'react';
import Editor from '@monaco-editor/react';

const MonacoEditor = ({ 
  language, 
  code, 
  onChange, 
  theme = 'vs-dark', 
  fontSize = 14, 
  wordWrap = 'on' 
}) => {
  
  // Map our language selection slug to Monaco language IDs
  const getMonacoLanguage = (lang) => {
    const l = lang.toLowerCase();
    if (l === 'cpp' || l === 'c++') return 'cpp';
    if (l === 'c') return 'c';
    if (l === 'python' || l === 'python3') return 'python';
    if (l === 'java') return 'java';
    if (l === 'javascript' || l === 'js') return 'javascript';
    return 'javascript';
  };

  const handleEditorChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  const editorOptions = {
    fontSize: fontSize,
    fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
    minimap: { enabled: false },
    wordWrap: wordWrap,
    automaticLayout: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    },
    lineNumbers: 'on',
    bracketPairColorization: { enabled: true },
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    padding: { top: 12, bottom: 12 },
    tabSize: 4,
    insertSpaces: true,
    autoIndent: 'advanced',
    formatOnType: true,
    formatOnPaste: true,
    scrollBeyondLastLine: false,
    hover: { enabled: true }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Editor
        height="100%"
        width="100%"
        language={getMonacoLanguage(language)}
        theme={theme}
        value={code}
        onChange={handleEditorChange}
        options={editorOptions}
        loading={
          <div style={{ 
            color: '#94a3b8', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            fontSize: '14px' 
          }}>
            Loading Monaco Workspace...
          </div>
        }
      />
    </div>
  );
};

export default MonacoEditor;
