// ==UserScript==
// @name         BenBen Better
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  在任意洛谷页面快速发送犇犇
// @author       Haokee & Claude Sonnet 4.5
// @match        https://www.luogu.com.cn/*
// @match        https://www.luogu.com/*
// @grant        GM_addStyle
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // 添加样式
    GM_addStyle(`
        /* 浮动按钮 */
        #benben-float-btn {
            position: fixed;
            right: 30px;
            bottom: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            cursor: pointer;
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            color: white;
            font-size: 24px;
            font-weight: bold;
            font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", "Noto Sans CJK SC", "Noto Sans CJK", "Source Han Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
        }

        #benben-float-btn::before {
            content: '犇';
        }

        #benben-float-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        #benben-float-btn:active {
            transform: scale(0.95);
        }

        /* 浮动窗口 */
        #benben-float-window {
            position: fixed;
            right: 30px;
            bottom: 100px;
            width: 380px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        #benben-float-window.show {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

        /* 窗口头部 */
        .benben-window-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .benben-window-title {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", "Noto Sans CJK SC", "Noto Sans CJK", "Source Han Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
        }

        .benben-close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            font-size: 18px;
            line-height: 1;
            font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", "Noto Sans CJK SC", "Noto Sans CJK", "Source Han Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
        }

        .benben-close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }

        /* 窗口内容 */
        .benben-window-content {
            padding: 20px;
        }

        .benben-textarea {
            width: 100%;
            min-height: 120px;
            padding: 12px;
            border: 2px solid #e8e8e8;
            border-radius: 8px;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", "Noto Sans CJK SC", "Noto Sans CJK", "Source Han Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
            resize: vertical;
            transition: border-color 0.3s;
            box-sizing: border-box;
        }

        .benben-textarea:focus {
            outline: none;
            border-color: #667eea;
        }

        .benben-textarea::placeholder {
            color: #999;
        }

        .benben-submit-btn {
            width: 100%;
            padding: 12px;
            margin-top: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", "Noto Sans CJK SC", "Noto Sans CJK", "Source Han Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
        }

        .benben-submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .benben-submit-btn:active {
            transform: translateY(0);
        }

        .benben-submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        /* 字数统计 */
        .benben-char-count {
            text-align: right;
            font-size: 12px;
            color: #999;
            margin-top: 8px;
            font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", "Noto Sans CJK SC", "Noto Sans CJK", "Source Han Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
        }

        /* 成功提示 */
        .benben-toast {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: #52c41a;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", "Noto Sans CJK SC", "Noto Sans CJK", "Source Han Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
        }

        .benben-toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        .benben-toast.error {
            background: #ff4d4f;
        }

        /* 响应式适配 */
        @media (max-width: 768px) {
            #benben-float-window {
                right: 10px;
                bottom: 80px;
                width: calc(100vw - 20px);
                max-width: 380px;
            }

            #benben-float-btn {
                right: 10px;
                bottom: 10px;
            }
        }

        /* 个人中心动态页面的回复按钮样式 */
        .feed-action-buttons {
            float: right;
            margin-left: 12px;
        }

        .feed-action-buttons a {
            color: #888;
            font-size: 14px;
            cursor: pointer;
            text-decoration: none;
            transition: color 0.2s;
        }

        .feed-action-buttons a:hover {
            color: #667eea;
        }
    `);

    // 创建 HTML 元素
    function createFloatingUI() {
        // 浮动按钮
        const floatBtn = document.createElement('div');
        floatBtn.id = 'benben-float-btn';
        floatBtn.title = '快速发送犇犇';

        // 浮动窗口
        const floatWindow = document.createElement('div');
        floatWindow.id = 'benben-float-window';
        floatWindow.innerHTML = `
            <div class="benben-window-header">
                <h3 class="benben-window-title">发送犇犇</h3>
                <button class="benben-close-btn" id="benben-close">×</button>
            </div>
            <div class="benben-window-content">
                <textarea
                    class="benben-textarea"
                    id="benben-textarea"
                    placeholder="有什么新鲜事告诉大家..."
                    maxlength="1000"
                ></textarea>
                <div class="benben-char-count">
                    <span id="benben-char-count">0</span> / 1000
                </div>
                <button class="benben-submit-btn" id="benben-submit">发送</button>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(floatBtn);
        document.body.appendChild(floatWindow);

        return { floatBtn, floatWindow };
    }

    // 显示提示消息
    function showToast(message, isError = false) {
        let toast = document.getElementById('benben-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'benben-toast';
            toast.className = 'benben-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = 'benben-toast' + (isError ? ' error' : '');

        // 显示
        setTimeout(() => toast.classList.add('show'), 10);

        // 3秒后隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 获取 CSRF Token
    function getCSRFToken() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        return null;
    }

    // 发送犇犇
    async function sendBenben(content) {
        try {
            // 优先使用 jQuery（洛谷页面自带）
            if (typeof $ !== 'undefined' && $.post) {
                return new Promise((resolve) => {
                    $.post("/api/feed/postBenben", {content: content}, function (resp) {
                        if (resp.status === 200) {
                            resolve({ success: true });
                        } else {
                            resolve({ success: false, message: resp.data || '发送失败' });
                        }
                    }).fail(function() {
                        resolve({ success: false, message: '网络错误，请稍后重试' });
                    });
                });
            }

            // 备用方案：使用 fetch + CSRF Token
            const csrfToken = getCSRFToken();
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest',
            };

            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }

            const response = await fetch('/api/feed/postBenben', {
                method: 'POST',
                headers: headers,
                credentials: 'include',
                body: `content=${encodeURIComponent(content)}`
            });

            const data = await response.json();

            if (data.status === 200) {
                return { success: true };
            } else {
                return { success: false, message: data.data || '发送失败' };
            }
        } catch (error) {
            return { success: false, message: '网络错误：' + error.message };
        }
    }

    // 提取用户名
    function extractUsername(feedElement) {
        // 方法1: 尝试.luogu-username a
        let usernameLink = feedElement.querySelector('.luogu-username a[href^="/user/"]');
        if (usernameLink) {
            return usernameLink.textContent.trim();
        }

        // 方法2: 尝试直接查找所有a标签
        const allLinks = feedElement.querySelectorAll('a[href^="/user/"]');
        console.log('[BenBen Better] 找到的用户链接数量:', allLinks.length);
        if (allLinks.length > 0) {
            const username = allLinks[0].textContent.trim();
            console.log('[BenBen Better] 提取到用户名:', username);
            return username;
        }

        console.log('[BenBen Better] 所有方法都未找到用户名');
        return null;
    }

    // 提取动态内容
    function extractFeedContent(feedElement) {
        const contentDiv = feedElement.querySelector('.content');
        if (contentDiv) {
            // 获取纯文本内容，去除多余空白
            return contentDiv.textContent.trim();
        }
        return '';
    }

    // 为动态元素添加回复按钮
    async function addActionButtons(feedElement) {
        // 检查是否已经添加过按钮
        if (feedElement.querySelector('.feed-action-buttons')) {
            return;
        }

        // 等待Vue渲染完成（最多等待3秒）
        for (let i = 0; i < 30; i++) {
            const metaDiv = feedElement.querySelector('.meta');
            const allLinks = feedElement.querySelectorAll('a[href^="/user/"]');

            // 如果找到了meta和用户链接，说明渲染完成
            if (metaDiv && allLinks.length > 0) {
                console.log('[BenBen Better] Vue渲染完成，用时:', i * 100, 'ms');
                break;
            }

            // 等待100ms后重试
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const metaDiv = feedElement.querySelector('.meta');
        if (!metaDiv) {
            console.log('[BenBen Better] 未找到 .meta 元素');
            return;
        }

        const username = extractUsername(feedElement);
        const feedContent = extractFeedContent(feedElement);

        if (!username) {
            return; // 静默失败，不再输出日志
        }

        console.log('[BenBen Better] 为用户添加按钮:', username);

        // 创建按钮容器
        const actionButtons = document.createElement('span');
        actionButtons.className = 'feed-action-buttons';

        // 创建回复按钮
        const replyBtn = document.createElement('a');
        replyBtn.textContent = '回复';
        replyBtn.href = 'javascript:void(0)';
        replyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleReply(username, feedContent);
        });

        actionButtons.appendChild(replyBtn);

        // 直接添加到 meta 末尾
        metaDiv.appendChild(actionButtons);

        console.log('[BenBen Better] 按钮添加成功');
    }

    // 处理回复
    function handleReply(username, feedContent = '') {
        const textarea = document.getElementById('benben-textarea');
        const floatWindow = document.getElementById('benben-float-window');

        if (textarea && floatWindow) {
            // 设置回复格式
            let replyText = `|| @${username} : `;

            // 如果有原内容，直接添加原文
            if (feedContent) {
                replyText += feedContent + '\n\n';
            }

            textarea.value = replyText;

            // 打开浮动窗口
            floatWindow.classList.add('show');

            // 聚焦到文本框末尾
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            }, 400);
        }
    }

    // 检查是否在个人中心动态页面
    function isUserActivityPage() {
        return window.location.pathname.includes('/user/') &&
               window.location.pathname.includes('/activity');
    }

    // 为现有的动态添加按钮
    function processExistingFeeds() {
        if (!isUserActivityPage()) {
            return;
        }

        const feeds = document.querySelectorAll('.feed:not(.feed-processed)');

        if (feeds.length > 0) {
            console.log('[BenBen Better] 找到动态数量:', feeds.length);
        }

        feeds.forEach(feed => {
            addActionButtons(feed);
            feed.classList.add('feed-processed');
        });
    }

    // 初始化个人中心动态页面的功能
    function initUserActivityPage() {
        console.log('[BenBen Better] 初始化个人中心功能，当前路径:', window.location.pathname);

        // 使用MutationObserver持续监听DOM变化
        const observer = new MutationObserver(() => {
            processExistingFeeds();
        });

        // 观察整个文档的变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 定期检查（适用于Vue渲染的单页应用）
        setInterval(() => {
            processExistingFeeds();
        }, 2000);

        console.log('[BenBen Better] 个人中心动态页面监听已启用');
    }

    // 初始化
    function init() {
        const { floatBtn, floatWindow } = createFloatingUI();

        const closeBtn = document.getElementById('benben-close');
        const submitBtn = document.getElementById('benben-submit');
        const textarea = document.getElementById('benben-textarea');
        const charCount = document.getElementById('benben-char-count');

        let isWindowOpen = false;

        // 点击浮动按钮
        floatBtn.addEventListener('click', () => {
            isWindowOpen = !isWindowOpen;
            if (isWindowOpen) {
                floatWindow.classList.add('show');
                setTimeout(() => textarea.focus(), 400);
            } else {
                floatWindow.classList.remove('show');
            }
        });

        // 点击关闭按钮
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isWindowOpen = false;
            floatWindow.classList.remove('show');
        });

        // 点击窗口外部关闭
        document.addEventListener('click', (e) => {
            if (isWindowOpen &&
                !floatWindow.contains(e.target) &&
                !floatBtn.contains(e.target)) {
                isWindowOpen = false;
                floatWindow.classList.remove('show');
            }
        });

        // 字数统计
        textarea.addEventListener('input', () => {
            const length = textarea.value.length;
            charCount.textContent = length;

            if (length > 900) {
                charCount.style.color = '#ff4d4f';
            } else if (length > 800) {
                charCount.style.color = '#faad14';
            } else {
                charCount.style.color = '#999';
            }
        });

        // 发送犇犇
        submitBtn.addEventListener('click', async () => {
            const content = textarea.value.trim();

            if (!content) {
                showToast('请输入内容', true);
                return;
            }

            // 禁用按钮
            submitBtn.disabled = true;
            submitBtn.textContent = '发送中...';

            // 发送
            const result = await sendBenben(content);

            if (result.success) {
                showToast('发送成功');
                textarea.value = '';
                charCount.textContent = '0';

                // 延迟关闭窗口
                setTimeout(() => {
                    isWindowOpen = false;
                    floatWindow.classList.remove('show');
                }, 1000);
            } else {
                showToast(result.message || '发送失败，请重试', true);
            }

            // 恢复按钮
            submitBtn.disabled = false;
            submitBtn.textContent = '发送';
        });

        // 支持 Ctrl+Enter 快捷键发送
        textarea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                submitBtn.click();
            }
        });

        console.log('[BenBen Better] 脚本已加载');

        // 初始化个人中心动态页面功能
        initUserActivityPage();
    }

    // 等待页面加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
