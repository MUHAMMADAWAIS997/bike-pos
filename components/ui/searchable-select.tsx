"use client";

import React, { useState, useRef, useEffect } from "react";
import { theme } from "@/lib/theme";

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  partner?: "violet" | "amber" | "pink" | "cyan";
  description?: string;
}

export interface SearchableSelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  clearable?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select or search...",
  label,
  error,
  disabled = false,
  clearable = true,
  fullWidth = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const dropdownTokens = theme.components.dropdown;
  const formTokens = theme.components.formFields;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.xs,
    width: fullWidth ? "100%" : "auto",
    maxWidth: "100%",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.labelMd.fontSize,
    fontWeight: 600,
    color: theme.colors.onSurfaceVariant,
  };

  const triggerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: formTokens.height,
    padding: formTokens.padding,
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    backgroundColor: disabled ? theme.colors.disabledBackground : formTokens.background,
    border: error ? `1px solid ${theme.colors.error}` : `1px solid ${formTokens.border}`,
    borderRadius: formTokens.borderRadius,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: isOpen ? formTokens.focusGlow : "none",
    borderColor: isOpen ? formTokens.focusBorder : error ? theme.colors.error : formTokens.border,
    transition: "all 0.15s ease-in-out",
  };

  const valueTextStyle: React.CSSProperties = {
    fontFamily: formTokens.fontFamily,
    fontSize: formTokens.fontSize,
    color: selectedOption ? formTokens.color : formTokens.placeholderColor,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const menuStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: dropdownTokens.menuBackground,
    border: dropdownTokens.menuBorder,
    borderRadius: dropdownTokens.menuRadius,
    boxShadow: dropdownTokens.menuShadow,
    overflow: "hidden",
    maxHeight: "260px",
    display: "flex",
    flexDirection: "column",
  };

  const searchInputStyle: React.CSSProperties = {
    width: "100%",
    padding: dropdownTokens.searchPadding,
    border: "none",
    borderBottom: `1px solid ${theme.colors.disabledBorder}`,
    fontSize: "13px",
    fontFamily: formTokens.fontFamily,
    color: formTokens.color,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      {label && <label style={labelStyle}>{label}</label>}

      <div
        style={triggerStyle}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
      >
        <span style={valueTextStyle}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs }}>
          {clearable && selectedOption && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              style={{
                background: "none",
                border: "none",
                color: theme.colors.onSurfaceVariant,
                cursor: "pointer",
                padding: "2px",
                fontSize: "14px",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
          <span
            style={{
              color: theme.colors.onSurfaceVariant,
              fontSize: "12px",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s ease",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {isOpen && (
        <div style={menuStyle}>
          <div style={{ padding: "4px" }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: theme.spacing.md,
                  fontSize: "13px",
                  color: dropdownTokens.emptyTextColor,
                  textAlign: "center",
                }}
              >
                No matching options
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                let optionBg = "transparent";
                if (isSelected) optionBg = dropdownTokens.itemSelectedBackground;
                else if (isHighlighted) optionBg = dropdownTokens.itemHoverBackground;

                const partnerColors = option.partner
                  ? theme.partnerPalette[option.partner]
                  : null;

                return (
                  <div
                    key={option.value}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(option.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      height: dropdownTokens.itemHeight,
                      padding: dropdownTokens.itemPadding,
                      backgroundColor: optionBg,
                      color: isSelected
                        ? dropdownTokens.itemSelectedColor
                        : dropdownTokens.itemColor,
                      cursor: "pointer",
                      fontSize: "14px",
                      fontFamily: formTokens.fontFamily,
                      transition: "background-color 0.1s ease",
                    }}
                  >
                    <span>{option.label}</span>

                    {partnerColors && (
                      <span
                        style={{
                          backgroundColor: partnerColors.bg,
                          color: partnerColors.main,
                          padding: "2px 6px",
                          borderRadius: theme.rounded.full,
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {option.partner}
                      </span>
                    )}

                    {!partnerColors && option.badge && (
                      <span
                        style={{
                          backgroundColor: theme.colors.surfaceContainerHigh,
                          color: theme.colors.onSurfaceVariant,
                          padding: "2px 6px",
                          borderRadius: theme.rounded.DEFAULT,
                          fontSize: "11px",
                        }}
                      >
                        {option.badge}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <span style={{ fontSize: "12px", color: theme.colors.error }}>
          {error}
        </span>
      )}
    </div>
  );
};
