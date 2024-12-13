chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action, sourceUrl, targetUrl, cookieKey } = request;
  if (action === 'transferCookie') {
    const sourceUrlObj = new URL(sourceUrl);
    const targetUrlObj = new URL(targetUrl);

    // 获取源网址的 cookie
    chrome.cookies.get({
      url: sourceUrl,
      name: cookieKey
    }, function (cookie) {
      if (cookie) {
        const { value, domain, path, secure, httpOnly, sameSite, expirationDate } = cookie;
        // 设置目标网址的 cookie
        chrome.cookies.set({
          url: targetUrl,
          name: cookieKey,
          value: value,
          domain: targetUrlObj.hostname,
          path: '/',
          secure: secure,
          httpOnly: httpOnly,
          sameSite: sameSite,
          expirationDate: expirationDate
        }, function (newCookie) {
          if (newCookie) {
            sendResponse({ success: true });
          } else {
            sendResponse({
              success: false,
              error: '设置目标 Cookie 失败：' + chrome.runtime.lastError?.message
            });
          }
        });
      } else {
        sendResponse({
          success: false,
          error: '未找到指定的源 Cookie'
        });
      }
    });
    return true; // 保持消息通道开启
  }
});