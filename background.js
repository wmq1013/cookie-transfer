chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action, sourceUrl, targetUrl, cookieKey } = request;
  if (action === 'transferCookie') {
    const sourceUrlObj = new URL(sourceUrl);
    const targetUrlObj = new URL(targetUrl);

    // 判断 cookieKey 是否为空或只包含空白字符
    if (!cookieKey || cookieKey.trim() === "") {
      // 获取源网址的所有 cookie
      chrome.cookies.getAll({ url: sourceUrl }, function (cookies) {
        let processedCount = 0;
        let successCount = 0;
        if (!cookies || cookies.length === 0) {
          sendResponse({
            success: false,
            message: '源网址没有可传输的 Cookie'
          });
          return;
        }
        for (let cookie of cookies) {
          const { name, value, domain, path, secure, httpOnly, sameSite, expirationDate } = cookie;
          chrome.cookies.set({
            url: targetUrl,
            name: name,
            value: value,
            domain: targetUrlObj.hostname,
            path: '/',
            secure: secure,
            httpOnly: httpOnly,
            sameSite: sameSite,
            expirationDate: expirationDate
          }, function (newCookie) {
            processedCount++;
            if (newCookie) {
              successCount++;
            }
            if (processedCount === cookies.length) {
              sendResponse({
                success: successCount > 0,
                message: `处理了 ${processedCount} 个 cookie，成功 ${successCount} 个`
              });
            }
          });
        }
      });
      return true;
    }

    let cookieKeyArr = cookieKey.split(',');
    let processedCount = 0;
    let successCount = 0;

    for (let key of cookieKeyArr) {
      // 获取源网址的 cookie
      chrome.cookies.get({
        url: sourceUrl,
        name: key
      }, function (cookie) {
        if (cookie) {
          const { value, domain, path, secure, httpOnly, sameSite, expirationDate } = cookie;
          // 设置目标网址的 cookie
          chrome.cookies.set({
            url: targetUrl,
            name: key,
            value: value,
            domain: targetUrlObj.hostname,
            path: '/',
            secure: secure,
            httpOnly: httpOnly,
            sameSite: sameSite,
            expirationDate: expirationDate
          }, function (newCookie) {
            processedCount++;
            if (newCookie) {
              successCount++;
            }
            // 当所有 cookie 都处理完毕时发送响应
            if (processedCount === cookieKeyArr.length) {
              sendResponse({
                success: successCount > 0,
                message: `处理了 ${processedCount} 个 cookie，成功 ${successCount} 个`
              });
            }
          });
        } else {
          processedCount++;
          // 当所有 cookie 都处理完毕时发送响应
          if (processedCount === cookieKeyArr.length) {
            sendResponse({
              success: successCount > 0,
              message: `处理了 ${processedCount} 个 cookie，成功 ${successCount} 个`
            });
          }
        }
      });
    }
    return true; // 保持消息通道开启
  }
});