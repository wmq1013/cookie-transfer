document.addEventListener('DOMContentLoaded', function () {
  const sourceUrlDom = document.getElementById('sourceUrl');
  const targetUrlDom = document.getElementById('targetUrl');
  const cookieKeyDom = document.getElementById('cookieKey');

  // 从 localStorage 中加载上次的输入
  sourceUrlDom.value = localStorage.getItem('sourceUrl') || '';
  targetUrlDom.value = localStorage.getItem('targetUrl') || '';
  cookieKeyDom.value = localStorage.getItem('cookieKey') || '';

  // 绑定 input 事件
  sourceUrlDom.addEventListener('input', () => {
    localStorage.setItem('sourceUrl', sourceUrlDom.value);
  });

  targetUrlDom.addEventListener('input', () => {
    localStorage.setItem('targetUrl', targetUrlDom.value);
  });

  cookieKeyDom.addEventListener('input', () => {
    localStorage.setItem('cookieKey', cookieKeyDom.value);
  });

  document.getElementById('transfer').addEventListener('click', function () {
    const sourceUrl = sourceUrlDom.value;
    const targetUrl = targetUrlDom.value;
    const cookieKey = cookieKeyDom.value;

    // 发送消息给 background script 处理 cookie 传输
    chrome.runtime.sendMessage({
      action: 'transferCookie',
      sourceUrl: sourceUrl,
      targetUrl: targetUrl,
      cookieKey: cookieKey
    }, function (response) {
      const transferStatusDom = document.getElementById('transferStatus');
      transferStatusDom.textContent = response?.message || (response?.success ? 'Cookie 传输成功！' : 'Cookie 传输失败!');
    });
  });
});