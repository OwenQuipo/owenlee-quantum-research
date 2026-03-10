const title = document.querySelector(".simple-page__title");
const codeEditors = [...document.querySelectorAll("[data-code-editor]")];
const codeShell = document.querySelector("[data-code-shell]");
const shellToggle = document.querySelector("[data-shell-toggle]");
const tabTriggers = [...document.querySelectorAll("[data-tab-trigger]")];
const tabPanels = [...document.querySelectorAll("[data-tab-panel]")];

if (title) {
  document.title = title.textContent || "Qubit Circuit Builder";
}

if (codeShell && shellToggle) {
  const shellBody = codeShell.querySelector(".code-shell__body");

  const setExpandedBodyHeight = () => {
    if (!shellBody || codeShell.dataset.collapsed === "true") {
      return;
    }

    shellBody.style.maxHeight = `${shellBody.scrollHeight}px`;
  };

  shellToggle.addEventListener("click", () => {
    if (!shellBody) {
      return;
    }

    const nextCollapsed = codeShell.dataset.collapsed !== "true";

    if (!nextCollapsed) {
      shellBody.hidden = false;
      shellBody.style.maxHeight = "0px";

      requestAnimationFrame(() => {
        shellBody.style.maxHeight = `${shellBody.scrollHeight}px`;
      });
    } else {
      shellBody.style.maxHeight = `${shellBody.scrollHeight}px`;

      requestAnimationFrame(() => {
        shellBody.style.maxHeight = "0px";
      });
    }

    codeShell.dataset.collapsed = String(nextCollapsed);
    shellToggle.setAttribute("aria-expanded", String(!nextCollapsed));
    shellToggle.textContent = nextCollapsed ? "Expand" : "Minimize";
  });

  if (shellBody) {
    shellBody.hidden = false;
    setExpandedBodyHeight();

    shellBody.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "max-height") {
        return;
      }

      const isCollapsed = codeShell.dataset.collapsed === "true";
      shellBody.hidden = isCollapsed;

      if (!isCollapsed) {
        shellBody.style.maxHeight = `${shellBody.scrollHeight}px`;
      }
    });

    window.addEventListener("resize", setExpandedBodyHeight);
  }
}

if (tabTriggers.length > 0 && tabPanels.length > 0) {
  const setActiveTab = (tabId, { focus = false } = {}) => {
    tabTriggers.forEach((trigger) => {
      const isActive = trigger.id === tabId;
      trigger.setAttribute("aria-selected", String(isActive));
      trigger.tabIndex = isActive ? 0 : -1;

      if (focus && isActive) {
        trigger.focus();
      }
    });

    tabPanels.forEach((panel) => {
      panel.hidden = panel.getAttribute("aria-labelledby") !== tabId;
    });

    if (codeShell?.dataset.collapsed !== "true") {
      const shellBody = codeShell?.querySelector(".code-shell__body");

      if (shellBody) {
        requestAnimationFrame(() => {
          shellBody.style.maxHeight = `${shellBody.scrollHeight}px`;
        });
      }
    }
  };

  const initialActiveTab =
    tabTriggers.find((trigger) => trigger.getAttribute("aria-selected") === "true")?.id ??
    tabTriggers[0].id;

  setActiveTab(initialActiveTab);

  tabTriggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      setActiveTab(trigger.id);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
        return;
      }

      event.preventDefault();

      let nextIndex = index;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabTriggers.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabTriggers.length) % tabTriggers.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabTriggers.length - 1;
      }

      setActiveTab(tabTriggers[nextIndex].id, { focus: true });
    });
  });
}

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const pythonKeywords = new Set([
  "False",
  "None",
  "True",
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
]);
const pythonBuiltins = new Set([
  "abs",
  "all",
  "any",
  "bool",
  "cls",
  "dict",
  "enumerate",
  "float",
  "int",
  "len",
  "list",
  "map",
  "max",
  "min",
  "print",
  "range",
  "self",
  "set",
  "str",
  "sum",
  "tuple",
  "zip",
]);
const blockStarters = /^(async\s+def|class|def|elif|else|except|finally|for|if|try|while|with)\b/;
const numberPattern = /^\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i;
const openerToCloser = { "(": ")", "[": "]", "{": "}" };
const closerToOpener = { ")": "(", "]": "[", "}": "{" };

const addRange = (ranges, start, end) => {
  if (start >= end) {
    return;
  }

  ranges.push({ start, end });
};

const mergeRanges = (ranges) => {
  if (ranges.length < 2) {
    return ranges;
  }

  const ordered = [...ranges].sort((left, right) => left.start - right.start);
  const merged = [ordered[0]];

  for (const range of ordered.slice(1)) {
    const previous = merged[merged.length - 1];

    if (range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end);
      continue;
    }

    merged.push(range);
  }

  return merged;
};

const findDiagnostics = (source) => {
  const diagnosticsByLine = Array.from(
    { length: Math.max(source.split("\n").length, 1) },
    () => [],
  );
  const stack = [];
  const lines = source.split("\n");

  lines.forEach((line, lineIndex) => {
    if (line.includes("\t")) {
      let tabIndex = line.indexOf("\t");

      while (tabIndex !== -1) {
        addRange(diagnosticsByLine[lineIndex], tabIndex, tabIndex + 1);
        tabIndex = line.indexOf("\t", tabIndex + 1);
      }
    }

    const trimmedStart = line.trimStart();
    const indentWidth = line.length - trimmedStart.length;

    if (trimmedStart && indentWidth % 4 !== 0) {
      addRange(diagnosticsByLine[lineIndex], 0, indentWidth);
    }

    if (blockStarters.test(trimmedStart) && !trimmedStart.endsWith(":")) {
      addRange(diagnosticsByLine[lineIndex], trimmedStart.length - 1, trimmedStart.length);
    }

    let inString = false;
    let quote = "";
    let escaped = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === "\\") {
          escaped = true;
          continue;
        }

        if (char === quote) {
          inString = false;
          quote = "";
        }

        continue;
      }

      if (char === "#") {
        break;
      }

      if (char === "'" || char === '"') {
        inString = true;
        quote = char;
        continue;
      }

      if (openerToCloser[char]) {
        stack.push({ char, line: lineIndex, column: index });
        continue;
      }

      if (closerToOpener[char]) {
        const previous = stack[stack.length - 1];

        if (!previous || previous.char !== closerToOpener[char]) {
          addRange(diagnosticsByLine[lineIndex], index, index + 1);
          continue;
        }

        stack.pop();
      }
    }

    if (inString) {
      addRange(diagnosticsByLine[lineIndex], line.length - 1, line.length);
    }
  });

  stack.forEach(({ line, column }) => {
    addRange(diagnosticsByLine[line], column, column + 1);
  });

  return diagnosticsByLine.map(mergeRanges);
};

const classifyToken = (token, nextToken) => {
  if (token.startsWith("#")) {
    return "comment";
  }

  if (
    token.startsWith('"') ||
    token.startsWith("'") ||
    token.startsWith('"""') ||
    token.startsWith("'''")
  ) {
    return "string";
  }

  if (pythonKeywords.has(token)) {
    return "keyword";
  }

  if (pythonBuiltins.has(token)) {
    return "builtin";
  }

  if (numberPattern.test(token)) {
    return "number";
  }

  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(token) && nextToken === "(") {
    return "function";
  }

  return "";
};

const renderSegment = (segment, tokenType, isError) => {
  const classes = [];

  if (tokenType) {
    classes.push(`token token--${tokenType}`);
  }

  if (isError) {
    classes.push("token token--error");
  }

  const content = escapeHtml(segment);
  return classes.length > 0 ? `<span class="${classes.join(" ")}">${content}</span>` : content;
};

const highlightLine = (line, diagnostics) => {
  const tokens = [];
  const pattern =
    /#.*$|"""|'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+(?:\.\d+)?(?:e[+-]?\d+)?|[A-Za-z_][A-Za-z0-9_]*|\s+|./g;

  let match = pattern.exec(line);

  while (match) {
    tokens.push({
      value: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
    match = pattern.exec(line);
  }

  return tokens
    .map((token, index) => {
      const nextToken = tokens[index + 1]?.value ?? "";
      const tokenType = /^\s+$/.test(token.value) ? "" : classifyToken(token.value, nextToken);
      const overlapsError = diagnostics.some(
        (range) => token.start < range.end && token.end > range.start,
      );

      if (!overlapsError || /^\s+$/.test(token.value)) {
        return renderSegment(token.value, tokenType, overlapsError);
      }

      let html = "";
      let cursor = token.start;

      diagnostics.forEach((range) => {
        if (range.end <= token.start || range.start >= token.end) {
          return;
        }

        const safeStart = Math.max(range.start, token.start);
        const safeEnd = Math.min(range.end, token.end);

        if (safeStart > cursor) {
          html += renderSegment(line.slice(cursor, safeStart), tokenType, false);
        }

        html += renderSegment(line.slice(safeStart, safeEnd), tokenType, true);
        cursor = safeEnd;
      });

      if (cursor < token.end) {
        html += renderSegment(line.slice(cursor, token.end), tokenType, false);
      }

      return html;
    })
    .join("");
};

const highlightSource = (source) => {
  const lines = source.split("\n");
  const diagnostics = findDiagnostics(source);

  return lines
    .map((line, index) => highlightLine(line, diagnostics[index] ?? []))
    .join("\n");
};

codeEditors.forEach((editor) => {
  const codeInput = editor.querySelector("[data-code-input]");
  const lineNumbers = editor.querySelector("[data-line-numbers]");
  const codeHighlight = editor.querySelector("[data-code-highlight]");

  if (!codeInput || !lineNumbers || !codeHighlight) {
    return;
  }

  const renderLineNumbers = () => {
    const lineCount = codeInput.value.split("\n").length;
    lineNumbers.textContent = Array.from(
      { length: Math.max(lineCount, 1) },
      (_, index) => `${index + 1}`,
    ).join("\n");
  };

  const renderHighlight = () => {
    const value = codeInput.value || " ";
    codeHighlight.innerHTML = highlightSource(value);
  };

  const syncScroll = () => {
    lineNumbers.scrollTop = codeInput.scrollTop;
    codeHighlight.scrollTop = codeInput.scrollTop;
    codeHighlight.scrollLeft = codeInput.scrollLeft;
  };

  renderLineNumbers();
  renderHighlight();
  syncScroll();

  codeInput.addEventListener("input", () => {
    renderLineNumbers();
    renderHighlight();
  });
  codeInput.addEventListener("scroll", syncScroll);
});
