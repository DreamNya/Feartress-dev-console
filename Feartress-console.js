//License MIT,fork from https://github.com/ChaseStrackbein/m3-dev-console 
(() => {
  /**
   * Cached jQuery objects
   */
  let $wrapper;
  let $consoleBody;
  let $resizeBar;
  let $header;
  let $clearBtn;
  let $closeBtn;
  let $logs;
  let $footer;
  let $footerGlyph;
  let $codeInput;
  let $expandBtn;
  let $gameHeaderBtnWrapper;
  let $gameHeaderBtn;

  let resizeStartHeight;
  let resizeStartMousePos;
  let resizing = false;
  let isCollapsed = false;
  let inputHistory = [];
  let inputHistoryPosition = -1;
  let logs = [];

  const captureConsole = () => {
    console.defaultLog = console.log.bind(console);
    console.log = function (...args) {
      addLog('log', args.join(' '));
      console.defaultLog.apply(console, args);
    };

    console.defaultError = console.error.bind(console);
    console.error = function (...args) {
      addLog('error', args.join(' '));
      console.defaultError.apply(console, args);
    };

    console.defaultWarn = console.warn.bind(console);
    console.warn = function (...args) {
      addLog('warn', args.join(' '));
      console.defaultWarn.apply(console, args);
    };

    console.defaultClear = console.clear.bind(console);
    console.clear = function (...args) {
      clearLogs();
      console.defaultClear.apply(console, args);
    };

    window.onerror = function (error) {
      try {
        addLog('error', error);
      } catch (e) {
        console.error(error);
      }
    };
  };

  const build = () => {
    $wrapper = $('<div>').addClass('m3c-wrapper d-none');
    $consoleBody = $('<div>').addClass('m3c-console-body');
    $resizeBar = $('<div>').addClass('m3c-resize');
    $header = $('<div>').addClass('m3c-header').text('Console');
    $headerBtnWrapper = $('<div>');
    $clearBtn = $('<div>').addClass('m3c-button').prop('title', 'Clear console').text("🗑");
    $closeBtn = $('<div>').addClass('m3c-button').prop('title', 'Close console').text("×");
    $logs = $('<div>').addClass('m3c-logs');
    $footer = $('<div>').addClass('m3c-footer');
    $footerGlyph = $('<span>').addClass('m3c-code-glyph').text("> ");
    $codeInput = $('<textarea>').addClass('m3c-input').prop('id', 'm3c-code-input').prop('spellcheck', false);
    $expandBtn = $('<div>').addClass('m3c-button m3c-no-pad').prop('title', 'Collapse').text("﹀");

    $wrapper.append(
      $consoleBody
        .append($resizeBar)
        .append($header.append($headerBtnWrapper.append($clearBtn).append($closeBtn)))
        .append($logs).append(
          $footer
            .append($footerGlyph)
            .append($codeInput)
            .append($expandBtn)
      ));

    $gameHeaderBtnWrapper = $('<div>');
    $gameHeaderBtn = $('<div>').addClass('console').text("Console");

    $gameHeaderBtnWrapper.append($gameHeaderBtn);
  };

  const attachEvents = () => {
    $codeInput.on('input', () => {
      $codeInput.css('height', '23px');
      $codeInput.css('height', `${$codeInput[0].scrollHeight}px`);
    });
  
    // Up key
    $codeInput.on('keydown', e => {
e.stopPropagation();
      if (e.which !== 38) return true;
      if ($codeInput[0].selectionStart !== $codeInput[0].selectionEnd) return true;
      const newLineIndex = $codeInput.val().indexOf('\n');
      if (newLineIndex > -1 && $codeInput[0].selectionStart > newLineIndex) return true;
      
      e.preventDefault();
      inputHistoryUp();
      return false;
    });

    // Down key
    $codeInput.on('keydown', e => {
e.stopPropagation();
      if (e.which !== 40) return true;
      if ($codeInput[0].selectionStart !== $codeInput[0].selectionEnd) return true;
      const lastNewLineIndex = $codeInput.val().lastIndexOf('\n');
      if (lastNewLineIndex > -1 && $codeInput[0].selectionStart < lastNewLineIndex) return true;
      
      e.preventDefault();
      inputHistoryDown();
      return false;
    });

    // Enter on code input to submit
    $codeInput.on('keydown', e => {
e.stopPropagation();
      if (e.which !== 13 || e.shiftKey) return true;
      
      e.preventDefault();
      submitConsole();
      return false;
    });

    // Esc key to lose focus on input
    $codeInput.on('keydown', e => {
e.stopPropagation();
      if (e.which !== 27) return true;
      
      e.preventDefault();
      $codeInput.blur();
      return false;
    });

    $clearBtn.on('click', clearLogs);
    $closeBtn.on('click', toggleConsole);
    $gameHeaderBtn.on('click', toggleConsole);

    if (window.kb) {
      window.kb.register('JS Console', 'General', { key: '~' }, toggleConsole);
    } else {
      $(document).on('keydown', e => {
        if (e.which !== 192 || !e.shiftKey) return true;
        if (stopHotKey(e)) return true;

        toggleConsole();
      });
    }

    $resizeBar.on('mousedown', e => {
      resizing = true;
      resizeStartHeight = $consoleBody.height();
      resizeStartMousePos = e.clientY;
      $(document).one('mouseup', () => resizing = false);
    });

    $(document).on('mousemove', e => {
      if (!resizing) return true;

      $consoleBody.css('height', `${resizeStartHeight + (resizeStartMousePos - e.clientY)}px`);
    });

    $expandBtn.on('click', e => {
      isCollapsed = !isCollapsed;
      $consoleBody.toggleClass('m3c-fit', isCollapsed);
      $wrapper.toggleClass('m3c-fit', isCollapsed);
      $resizeBar.toggleClass('d-none', isCollapsed);
      $header.toggleClass('d-none', isCollapsed);
      $logs.toggleClass('d-none', isCollapsed);
      $expandBtn.text($expandBtn.text()=="﹀"?"︿":"﹀")
        .prop('title', isCollapsed ? 'Expand' : 'Collapse');
    });
  };

  const inject = () => {
    $('body').prepend($wrapper);

    // Wait until main game UI is loaded for button
    let loadingInterval = setInterval(() => {
      if ($("#reset-container").length==0) return;

      $("#reset-container").before($gameHeaderBtnWrapper);
      clearInterval(loadingInterval);
    }, 500);
  };

  const stopHotKey = (e) => {
    if (e.target === $codeInput[0]) return false;
    return e.target.tagName == 'INPUT' || e.target.tagName == 'SELECT' || e.target.tagName == 'TEXTAREA' || e.target.isContentEditable; 
  };

  const toggleConsole = () => {
    $wrapper.toggleClass('d-none');
    if ($wrapper.is(':visible')) {
      updateLogUI();
      $(document).one('keyup', () => $codeInput.focus());
    }
  };

  const inputHistoryUp = () => {
    if (!inputHistory.length) return;
    if (inputHistoryPosition === 0) return;
    inputHistoryPosition = inputHistoryPosition === -1 ? inputHistory.length - 1 : inputHistoryPosition - 1;
    
    $codeInput.val(inputHistory[inputHistoryPosition]);
    $codeInput.trigger('input');
  };

  const inputHistoryDown = () => {
    inputHistoryPosition = inputHistoryPosition === -1 || inputHistoryPosition === (inputHistory.length - 1) ? -1 : inputHistoryPosition + 1;
    
    if (inputHistoryPosition === -1 || !inputHistory.length) {
      $codeInput.val('');
      $codeInput.trigger('input');
      return;
    }
    
    $codeInput.val(inputHistory[inputHistoryPosition]);
    $codeInput.trigger('input');
  };

  const submitConsole = () => {
    addLog('input', $codeInput.val());
    try {
      const res = eval($codeInput.val());
      if (!$codeInput.val().includes('console.clear()'))
        addLog('output', res);
    } catch (e) {
      addLog('error', `${e.name}: ${e.message}`);
    }
    if (inputHistoryPosition !== inputHistory.length - 1 || $codeInput.val() !== inputHistory[inputHistoryPosition])
      inputHistory.push($codeInput.val());
    $codeInput.val('');
    $codeInput.trigger('input');
    inputHistoryPosition = -1;
  };

  const addLog = (type, message) => {
    let formattedMessage;
    switch (typeof message) {
      case 'string':
        formattedMessage = message;
        break;
      case 'number':
        formattedMessage = message.toString();
        break;
      case 'object':
        formattedMessage = JSON.stringify(message);
        break;
      case 'undefined':
        formattedMessage = 'undefined';
        break;
      default:
        formattedMessage = message.toString();
        break;
    }

    logs.push({ type, message: formattedMessage });
    if ($wrapper.is(':visible')) updateLogUI();
  };

  const updateLogUI = () => {
    for (let i = $logs.children().length; i < logs.length; i++) {
      $logs.append(buildLog(logs[i]));
    }
    $logs.scrollTop($logs[0].scrollHeight);
  };

  const buildLog = (log) => {
    const $log = $('<div>').addClass('m3c-log');
    const $iconWrapper = $('<div>').addClass('m3c-log-icon');
    const $icon = $('<div>');
    const $message = $('<div>').addClass('m3c-log-message')
      .html(log.message.replace(/\n/g, '<br />'));
    
    switch (log.type) {
      case 'input':
        $icon.text("> ");
        break;
      case 'output':
        $icon.text("< ");
        break;
      case 'error':
        $log.addClass('m3c-log-error');
        $icon.text("❌");
        break;
      case 'warn':
        $log.addClass('m3c-log-warn');
        $icon.text("⚠");
        break;
      default:
        break;
    }

    return $log.append($iconWrapper.append($icon)).append($message);
  };

  const clearLogs = () => {
    logs = [];
    $logs.empty();
  };

  captureConsole();
  build();
  attachEvents();
  inject();
})();
