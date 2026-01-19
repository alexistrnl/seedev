'use client';

import { useRef, useEffect, useState } from 'react';
import './rich-text-editor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeCommands, setActiveCommands] = useState({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
  });
  const [selectedColor, setSelectedColor] = useState('#000000');

  // Synchroniser le contenu externe avec l'éditeur (seulement si l'éditeur n'est pas en focus)
  useEffect(() => {
    if (editorRef.current && !isFocused && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, isFocused]);

  const updateActiveCommands = () => {
    if (editorRef.current && document.activeElement === editorRef.current) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      let isInList = false;
      let listType = '';
      
      if (range) {
        const parentElement = range.commonAncestorContainer.parentElement;
        if (parentElement) {
          const listParent = parentElement.closest('ul, ol');
          if (listParent) {
            isInList = true;
            listType = listParent.tagName.toLowerCase();
          }
        }
      }
      
      setActiveCommands({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        unorderedList: isInList && listType === 'ul',
        orderedList: isInList && listType === 'ol',
      });
      
      // Détecter la couleur actuelle du texte sélectionné
      const color = document.queryCommandValue('foreColor');
      if (color && color !== 'rgb(0, 0, 0)') {
        // Convertir rgb() en hex si nécessaire
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
          const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
          const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
          setSelectedColor(`#${r}${g}${b}`);
        } else if (color.startsWith('#')) {
          setSelectedColor(color);
        }
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateActiveCommands();
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColor(color);
    execCommand('foreColor', color);
  };

  const handleColorButtonClick = () => {
    colorInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Permettre Ctrl+B pour gras, Ctrl+I pour italique, Ctrl+U pour souligné
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        execCommand('bold');
      } else if (e.key === 'i') {
        e.preventDefault();
        execCommand('italic');
      } else if (e.key === 'u') {
        e.preventDefault();
        execCommand('underline');
      }
    }
  };

  useEffect(() => {
    if (isFocused) {
      const handleSelection = () => {
        updateActiveCommands();
      };
      document.addEventListener('selectionchange', handleSelection);
      return () => {
        document.removeEventListener('selectionchange', handleSelection);
      };
    }
  }, [isFocused]);

  return (
    <div className={`rich-text-editor ${className} ${isFocused ? 'rich-text-editor-focused' : ''}`}>
      {/* Barre d'outils */}
      <div className="rich-text-editor-toolbar">
        <button
          type="button"
          className={`rich-text-editor-btn ${activeCommands.bold ? 'rich-text-editor-btn-active' : ''}`}
          onClick={() => execCommand('bold')}
          title="Gras (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`rich-text-editor-btn ${activeCommands.italic ? 'rich-text-editor-btn-active' : ''}`}
          onClick={() => execCommand('italic')}
          title="Italique (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`rich-text-editor-btn ${activeCommands.underline ? 'rich-text-editor-btn-active' : ''}`}
          onClick={() => execCommand('underline')}
          title="Souligné (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <div className="rich-text-editor-separator"></div>
        <button
          type="button"
          className={`rich-text-editor-btn ${activeCommands.unorderedList ? 'rich-text-editor-btn-active' : ''}`}
          onClick={() => execCommand('insertUnorderedList')}
          title="Liste à puces"
        >
          <svg className="rich-text-editor-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="3" cy="4" r="1" fill="currentColor"/>
            <circle cx="3" cy="8" r="1" fill="currentColor"/>
            <circle cx="3" cy="12" r="1" fill="currentColor"/>
            <line x1="6" y1="4" x2="13" y2="4" stroke="currentColor"/>
            <line x1="6" y1="8" x2="13" y2="8" stroke="currentColor"/>
            <line x1="6" y1="12" x2="13" y2="12" stroke="currentColor"/>
          </svg>
        </button>
        <button
          type="button"
          className={`rich-text-editor-btn ${activeCommands.orderedList ? 'rich-text-editor-btn-active' : ''}`}
          onClick={() => execCommand('insertOrderedList')}
          title="Liste numérotée"
        >
          <svg className="rich-text-editor-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <text x="2" y="5" fontSize="10" fontWeight="600" fill="currentColor">1</text>
            <text x="2" y="9" fontSize="10" fontWeight="600" fill="currentColor">2</text>
            <text x="2" y="13" fontSize="10" fontWeight="600" fill="currentColor">3</text>
            <line x1="5" y1="4" x2="13" y2="4" stroke="currentColor"/>
            <line x1="5" y1="8" x2="13" y2="8" stroke="currentColor"/>
            <line x1="5" y1="12" x2="13" y2="12" stroke="currentColor"/>
          </svg>
        </button>
        <div className="rich-text-editor-separator"></div>
        <div className="rich-text-editor-color-wrapper">
          <button
            type="button"
            className="rich-text-editor-btn rich-text-editor-color-btn"
            onClick={handleColorButtonClick}
            title="Couleur du texte"
          >
            <span className="rich-text-editor-color-icon">A</span>
            <div
              className="rich-text-editor-color-preview"
              style={{ backgroundColor: selectedColor }}
            />
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
            className="rich-text-editor-color-input"
            title="Sélectionner une couleur"
          />
        </div>
      </div>

      {/* Zone d'édition */}
      <div
        ref={editorRef}
        className="rich-text-editor-content"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}
