#!/bin/bash

# nvim-context.sh - Show context from Neovim current location
# This script reads /tmp/nvim-current.txt and displays the current code context

NVIM_CONTEXT_FILE="/tmp/nvim-current.txt"

# Check if the context file exists
if [ ! -f "$NVIM_CONTEXT_FILE" ]; then
  exit 0
fi

# Read the file path and line number
FILE_PATH=$(head -n 1 "$NVIM_CONTEXT_FILE")
LINE_NUMBER=$(tail -n 1 "$NVIM_CONTEXT_FILE")

# Validate file exists
if [ ! -f "$FILE_PATH" ]; then
  echo "⚠️  File not found: $FILE_PATH"
  exit 0
fi

# Get total lines in file
TOTAL_LINES=$(wc -l < "$FILE_PATH")

# Validate line number
if ! [[ "$LINE_NUMBER" =~ ^[0-9]+$ ]] || [ "$LINE_NUMBER" -lt 1 ] || [ "$LINE_NUMBER" -gt "$TOTAL_LINES" ]; then
  echo "⚠️  Invalid line number: $LINE_NUMBER (file has $TOTAL_LINES lines)"
  exit 0
fi

# Calculate context window (10 lines before and after)
CONTEXT_LINES=10
START_LINE=$((LINE_NUMBER - CONTEXT_LINES))
END_LINE=$((LINE_NUMBER + CONTEXT_LINES))

# Ensure we don't go below line 1
if [ $START_LINE -lt 1 ]; then
  START_LINE=1
fi

# Ensure we don't go beyond total lines
if [ $END_LINE -gt $TOTAL_LINES ]; then
  END_LINE=$TOTAL_LINES
fi

# Display the context
echo ""
echo "📍 Current Neovim Location: $FILE_PATH:$LINE_NUMBER"
echo ""

# Extract and display the context with line numbers
sed -n "${START_LINE},${END_LINE}p" "$FILE_PATH" | while IFS= read -r line; do
  CURRENT_LINE=$START_LINE
  if [ $CURRENT_LINE -eq $LINE_NUMBER ]; then
    # Highlight the current line
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "➤  $(printf '%4d' $CURRENT_LINE) │ $line"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  else
    echo "  $(printf '%4d' $CURRENT_LINE) │ $line"
  fi
  START_LINE=$((START_LINE + 1))
done

echo ""
echo "📝 File: $FILE_PATH"
echo "📊 Line: $LINE_NUMBER of $TOTAL_LINES"
echo ""
