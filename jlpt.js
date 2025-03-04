var examLevel = localStorage.getItem("tool_examLevel");
if (!examLevel) {
    examLevel = 1;
} else {
    examLevel = parseInt(examLevel);
}

function _onExamLevelChange(v) {
    examLevel = parseInt(v);
    kdInfos = {}; //更改报考等级需要清空缓存的考点信息
    localStorage.setItem("tool_examLevel", examLevel);
}

var isChangeSeat = localStorage.getItem("tool_isChangeSeat") == "true";

function _onIsChangeSeatChange(v) {
    isChangeSeat = v;
    localStorage.setItem("tool_isChangeSeat", v ? "true" : "false");
}

function _onIsChangeSeatHelp() {
    alert("1、订座成功后有且仅有一次改座机会。\n2、改座失败不影响当前订座。\n3、目标考场不要包含已报考场。");
}

var fastTryAddr = localStorage.getItem("tool_fastTryAddr");
if (!fastTryAddr) {
    fastTryAddr = [];
} else {
    fastTryAddr = JSON.parse(fastTryAddr);
}

function _onFastTryAddrChange(v) {
    fastTryAddr = v.split(',').map(item => item.trim()).filter(item => item !== '');
    localStorage.setItem("tool_fastTryAddr", JSON.stringify(fastTryAddr));
}

function _onFastTryAddrHelp() {
    alert("填写考点代号，用英文逗号分隔，例如：\n\n1020101,1020103,1020105\n\n1、因为在人多的时候，查询接口会卡。而第一天往往所有考场都是有座位的，所以可以跳过查询直接订座。\n2、可以在这里填写考场，会自动卡时间，2点开始，按照顺序尝试直接订座。注意每次订座都需要消耗验证码。");
}

var targetAddr = localStorage.getItem("tool_targetAddr");
if (!targetAddr) {
    targetAddr = [];
} else {
    targetAddr = JSON.parse(targetAddr);
}

function _onTargetAddrChange(v) {
    targetAddr = v.split(',').map(item => item.trim());
    localStorage.setItem("tool_targetAddr", JSON.stringify(targetAddr));
}

function _onTargetAddrHelp() {
    alert("填写考点代号，用英文逗号分隔，例如：\n\n1020101,1020103,1020105\n\n会通过接口去查询哪个有空座，然后按照列表的优先顺序选择有空座的考场。");
}

var ocrOn = localStorage.getItem("tool_ocrOn") == "true";

function _onIsOcrOnChange(v) {
    ocrOn = v;
    localStorage.setItem("tool_ocrOn", v ? "true" : "false");
}

var ocrUrl = localStorage.getItem("tool_ocrUrl");
if (!ocrUrl) {
    ocrUrl = "http://localhost:5000/ocr";
}

function _onOcrUrlChange(v) {
    ocrUrl = v;
    localStorage.setItem("tool_ocrUrl", ocrUrl);
}

function _onOcrHelp() {
    alert("1、可以用一些OCR方法自动识别验证码。\n2、参考说明搭建，填入url，勾选开关。\n3、自动识别准确率有限，网络高峰期可能导致刷新验证码较慢。");
}

//报考开始时间
const startHour = 14
const startMinite = 0
const startSecond = 0

let offsetX, offsetY, initialX, initialY;

let toolWindow;
function _initGUI() {
    toolWindow = document.getElementById('tool-window');
    if (!toolWindow) {
        toolWindow = document.createElement("div");
        toolWindow.id = "tool-window";
        toolWindow.style = "position: absolute; right: 50px; bottom: 50px; width: 700px; height: 500px; background-color: #ccc; z-index: 999";
        toolWindow.innerHTML = `
        <div id="tool-title" style="background-color: aqua; margin: 5px; text-align:center; cursor: move;">JLPT抢座脚本(可拖动)</div>
        <div style="width: 250px; display: inline-block; vertical-align: top">
            <div style="margin: 10px">
                <label>报考等级：</label>
                <select id="tool-examLevel" onchange="_onExamLevelChange(document.getElementById('tool-examLevel').value)">
                    <option value="1">N1</option>
                    <option value="2">N2</option>
                    <option value="3">N3</option>
                    <option value="4">N4</option>
                    <option value="5">N5</option>
                </select>
                <a href="https://jlpt.neea.cn/kdinfo.do?kdid=info" target="_blank" style="margin-left: 5px">查看考场列表</a>
            </div>
            <div style="margin: 10px">
                <label>改座模式：</label>
                <input id="tool-changeSeat" type="checkbox" onchange="_onIsChangeSeatChange(document.getElementById('tool-changeSeat').checked)">启用</input>
                <a onclick="_onIsChangeSeatHelp()" style="cursor: pointer; margin-left: 10px">？</a>
            </div>
            <div style="margin: 10px">
                <label>快速抢座考场：</label>
                <a onclick="_onFastTryAddrHelp()" style="cursor: pointer">？</a>
                <textarea id="tool-fastTryAddr" rows="5" style="resize: none; width: 100%;" onchange="_onFastTryAddrChange(document.getElementById('tool-fastTryAddr').value)"></textarea>
            </div>
            <div style="margin: 10px">
                <label>目标考场：</label>
                <a onclick="_onTargetAddrHelp()" style="cursor: pointer">？</a>
                <textarea id="tool-targetAddr" rows="5" style="resize: none; width: 100%;" onchange="_onTargetAddrChange(document.getElementById('tool-targetAddr').value)"></textarea>
            </div>
            <div style="margin: 10px">
                <button id="tool-start" onclick="start()" style="margin: 10px">开始</label>
                <button id="tool-stop" onclick="stop()" style="margin: 10px">停止</label>
            </div>
            <div style="margin: 10px">
                <label>验证码：</label>
                <img id="tool-chkImg" border="1" alt="验证码" width="80" height="25"><br/>
                <label>答案(回车提交)：</label>
                <input id="tool-chkImgAns" style="width: 100px" onkeydown="_handleChkImgKeyDown(event)"></input>
                <label>自动识别：</label>
                <a onclick="_onOcrHelp()" style="cursor: pointer">？</a>
                <input id="tool-ocrOn" type="checkbox" onchange="_onIsOcrOnChange(document.getElementById('tool-ocrOn').checked)">启用</input><br/>
                <input id="tool-ocrUrl" style="width: 100%" onchange="_onOcrUrlChange(document.getElementById('tool-ocrUrl').value)"></input>
            </div>
        </div>
        <div style="width: 400px; height: 100%; display: inline-block; vertical-align: top">
            <div style="margin: 10px">
                <label>日志：</label>
                <button onclick="_clearLog()" style="margin-left: 10px">清空</button>
                <textarea id="tool-log" rows="25" wrap="off" style="resize: none; width: 100%"></textarea>
            </div>
        </div>
        `;
        document.body.append(toolWindow);

        document.getElementById('tool-examLevel').value = examLevel;
        document.getElementById('tool-changeSeat').checked = isChangeSeat;
        document.getElementById('tool-fastTryAddr').value = fastTryAddr.join(",");
        document.getElementById('tool-targetAddr').value = targetAddr.join(",");
        document.getElementById('tool-ocrOn').checked = ocrOn;
        document.getElementById('tool-ocrUrl').value = ocrUrl;
        document.getElementById('tool-stop').disabled = true;

        //增加拖动的功能
        let dragger = document.getElementById("tool-title");

        // 当鼠标按下时
        dragger.addEventListener('mousedown', function (e) {
            // 计算初始位置
            offsetX = e.clientX - toolWindow.offsetLeft;
            offsetY = e.clientY - toolWindow.offsetTop;
            initialX = toolWindow.offsetLeft;
            initialY = toolWindow.offsetTop;

            // 当鼠标移动时
            document.addEventListener('mousemove', _dragWindow);
            // 当鼠标松开时
            document.addEventListener('mouseup', _stopDragWindow);
        });
    }
}

function _dragWindow(e) {
    // 计算当前位置
    const currentX = e.clientX - offsetX;
    const currentY = e.clientY - offsetY;

    // 将悬浮窗移动到当前位置
    toolWindow.style.left = currentX + 'px';
    toolWindow.style.top = currentY + 'px';
}

function _stopDragWindow() {
    // 当鼠标松开时，移除事件监听器
    document.removeEventListener('mousemove', _dragWindow);
    document.removeEventListener('mouseup', _stopDragWindow);
}

function _log(msg, obj) {
    let str;
    if (obj) {
        str = msg + ": " + JSON.stringify(obj) + "\n";
        console.log(msg, obj);
    } else {
        str = msg + "\n";
        console.log(msg);
    }
    let logView = document.getElementById('tool-log');
    logView.value += str;
    logView.scrollTop = logView.scrollHeight;
}

function _clearLog() {
    document.getElementById('tool-log').value = '';
}

_initGUI();

async function _delay(timeountMS) {
    return new Promise((fin) => {
        setTimeout(fin, timeountMS);
    });
}

var chkImgAnsPromise = null;

function _handleChkImgKeyDown(event) {
    if (event.key === 'Enter') {
        let inputValue = event.target.value;
        if (inputValue) {
            inputValue = inputValue.trim().toUpperCase();
        }
        event.target.value = '';

        if (chkImgAnsPromise) {
            let fin = chkImgAnsPromise;
            chkImgAnsPromise = null;
            document.getElementById("tool-chkImg").src = "";
            fin(inputValue);
        } else if (inputValue == "EXIT" && !canExit) {
            stop();
        }
    }
}

async function _tryOCR(url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${ocrUrl}?url=${url}`);
    xhr.onload = function() {
      if (xhr.status === 200) {
        let fin = chkImgAnsPromise;
        chkImgAnsPromise = null;
        if (fin) {
            let ans = xhr.responseText;
            if (ans.length == 4) {
                fin(ans.toUpperCase());
            } else {
                _log("验证码OCR识别失败");
                fin(null);
            }
        }
      }
    };
    xhr.onerror = () => {
        _log("验证码OCR请求失败");
        let fin = chkImgAnsPromise;
        chkImgAnsPromise = null;
        if (fin) {
            fin(null);
        }
    }
    xhr.send();
}

async function _refreshImg() {
    document.getElementById("tool-chkImg").src = "";
    return new Promise((fin) => {
        chkImgAnsPromise = null;
        let a = user.get("chkImgFlag");
        if (!a) {
            a = generateRandomFlag(18);
            user.set("chkImgFlag", a)
        }
        let timeout = 2000;
        let timer = setTimeout(() => {
            timer = null;
            _log('chkImg.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        new Ajax.Request(getURL("chkImg.do"), {
            method: "post",
            parameters: "chkImgFlag=" + a,
            requestHeaders: {
                RequestType: "ajax"
            },
            onSuccess: function (g) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                let h = g.responseJSON;
                if (h == null) {
                    g.request.options.onFailure();
                    return
                }
                _log("chkImg.do", h);
                if (!h.retVal) {
                    _log("获取验证码失败：" + errorCode[h.errorNum]);
                    fin(null);
                    return
                }
                user.set("chkImgSrc", h.chkImgFilename);
                
                chkImgAnsPromise = fin;

                let useOcr = ocrOn && ocrUrl && ocrUrl.length > 0;
                let startTime = new Date().setHours(startHour, startMinite, startSecond, 0);
                if (useOcr && new Date().getTime() < startTime) {
                    //自动识别存在失误的概率，为了增加2点刚开始时候的抢座成功率，手动输入一个正确答案
                    _log("当前未到订座时间，请手动输入验证码确保成功率");
                    useOcr = false;
                }

                if (useOcr) {
                    _log("尝试自动识别验证码...");
                    _tryOCR(h.chkImgFilename);
                } else {
                    document.getElementById("tool-chkImg").src = h.chkImgFilename;
                    _log("【【【请输入验证码】】】");
                    document.getElementById("tool-chkImgAns").value = "";
                    document.getElementById("tool-chkImgAns").focus();
                }
            },
            onFailure: function (g) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("获取验证码失败，请点击验证码重新获取!");
                fin(null);
            }
        })
    });
}

var kdInfos = {};
async function _chooseAddr(onlyQuery) {
    return new Promise((fin) => {
        let timeout = 3000;
        let timer = setTimeout(() => {
            timer = null;
            _log('chooseAddr.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        user.set("bkjb", examLevel);
        new Ajax.Request("chooseAddr.do?bkjb=" + user.get("bkjb"), {
            method: "get",
            requestHeaders: {
                RequestType: "ajax"
            },
            onSuccess: function (originalRequest) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                let jsonObj = eval(originalRequest.responseText);
                if (jsonObj == null) {
                    originalRequest.request.options.onFailure();
                    return
                }
                let kdInfo = $A(jsonObj);
                let canBookList = {};
                let canBook = null;
                for (let i = 0; i < kdInfo.size(); ++i) {
                    let kd = kdInfo[i];
                    if (kd.vacancy > 0 && !onlyQuery) {
                        _log("找到有空座的考场", kd);
                        canBookList[kd.dm] = kd;
                    }
                    kdInfos[kd.dm] = kd.id;
                }
                for (let i = 0; i < targetAddr.size(); ++i) {
                    let t = targetAddr[i];
                    if (canBookList[t]) {
                        canBook = canBookList[t];
                        break;
                    }
                }
                if (!onlyQuery) {
                    if (!canBook) {
                        _log("暂时没有空座位");
                    } else {
                        _log("目标考场", canBook);
                    }
                }
                fin(canBook);
            },
            onFailure: function (originalRequest) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("查询考点信息失败");
                fin(null);
            }
        })
    });
}

async function _bookseat(kd, code) {
    return new Promise((fin) => {
        let timeout = 5000;
        let timer = setTimeout(() => {
            timer = null;
            _log('book.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        user.set("bkjb", examLevel);
        user.set("bkkd", kd.id);
        let url;
        if (isChangeSeat) {
            url = getURL("changebook.do");
        } else {
            url = getURL("book.do");
        }
        new Ajax.Request(url, {
            method: "post",
            requestHeaders: {
                RequestType: "ajax"
            },
            parameters: serializeUser(["bkjb", "bkkd", "ksid", "ksIdNo", "chkImgFlag", "ksLoginFlag"]) + "&chkImgCode=" + code,
            onCreate: function () {
                _log("定座请求发送中...", kd);
            },
            onSuccess: function (e) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                let h = e.responseJSON;
                if (h == null) {
                    e.request.options.onFailure();
                    return
                }
                _log(isChangeSeat ? "changebook.do" : "book.do", h);
                clearChkimgCache();
                fin(h);
            },
            onFailure: function () {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("定座请求失败");
                fin(null);
            }
        })
    });
}

async function _queryBook() {
    return new Promise((fin) => {
        let timeout = 5000;
        let timer = setTimeout(() => {
            timer = null;
            _log('queryBook.do timed out after ' + timeout + ' ms');
            fin(null);
        }, timeout);
        new Ajax.Request(getURL("queryBook.do"), {
            method: "post",
            requestHeaders: {
                RequestType: "ajax"
            },
            parameters: serializeUser(["ksid", "ksIdNo", "ksLoginFlag"]),
            onCreate: function () {
                _log("定座请求结果查询中...");
            },
            onSuccess: function (l) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                let m = l.responseJSON;
                if (m == null) {
                    l.request.options.onFailure();
                    return
                }
                _log("queryBook.do", m);
                fin(m);
            },
            onFailure: function () {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                } else {
                    return;
                }
                _log("定座请求结果查询中失败");
                fin(null);
            }
        });
    });
}

var canExit = false;

async function loop() {
    let answer = null;
    let answerTime = 0;
    let kd = null;
    let fastTryList = fastTryAddr.slice();
    let startTime = new Date().setHours(startHour, startMinite, startSecond, 0);
    let waitHint = false;

    _log("开始工作，当前报考等级：" + examLevel);

    while (!canExit) {
        let now = new Date().getTime();
        while (!canExit && (!answer || (now - answerTime > 1000 * 60 * 5))) {
            //实测5分钟的验证码是可以用的，10分钟会导致验证码已过期
            answer = null;
            answerTime = now;
            answer = await _refreshImg();
            if (answer && answer.length == 4) {
                _log("验证码：" + answer);
                break;
            } else {
                answer = null;
            }
        }
        
        if (!answer || answer == "EXIT") {
            canExit = true;
            break;
        }

        if (!kd) {
            if (fastTryList.length > 0) {
                if (Object.keys(kdInfos).length == 0) {
                    _log("查询考点信息");
                    await _chooseAddr(true);
                    if (Object.keys(kdInfos).length == 0) {
                        await _delay(500);
                        _log("查询考点信息失败");
                        continue;
                    }
                }
                _log("###尝试直接订座：" + fastTryList[0]);
                let kdid = kdInfos[fastTryList[0]];
                if (kdid) {
                    kd = { id: kdid, dm: fastTryList[0] };
                } else {
                    _log("考点不存在：" + fastTryList[0]);
                    fastTryList = fastTryList.slice(1);
                    continue;
                }
            } else {
                kd = await _chooseAddr(false);
            }
            if (!kd) {
                await _delay(1000);
                continue;
            }
        }

        //只有1个目标考场的时候，因为直接发请求，所以最好等时间到了再继续。
        if (fastTryList.length > 0 && new Date().getTime() < startTime) {
            if (!waitHint) {
                _log(`时间还没到，等到${startHour}:${startMinite}:${startSecond}之后自动开始...`);
                waitHint = true;
            }
            await _delay(200);
            continue;
        }

        let r = await _bookseat(kd, answer);
        answer = null;
        answerTime = 0;
        if (!r) {
            await _delay(500);
            continue;
        } else if (r.retVal == 0) {
            _log("订座失败：" + errorCode[r.errorNum]);
            if (r.errorNum == 305 || r.errorNum == 306) {
                //验证码过期或错误
            } else {
                kd = null;
                if (fastTryList.length > 0) {
                    fastTryList = fastTryList.slice(1)
                }
            }
            continue;
        }

        if (isChangeSeat) {
            //改座模式不需要查询
            _log("改座成功！", kd);
            canExit = true;
            break;
        }

        while (!canExit) {
            r = await _queryBook();
            if (!r) {
                continue;
            } else if (r.retVal == 0) {
                _log("订座查询显示失败", errorCode[r.errorNum]);
                if (r.errorNum == 310) {
                    //重试
                    await _delay(200);
                    continue;
                } else if (r.errorNum == 313) {
                    //满了
                    kd = null;
                    if (fastTryList.length > 0) {
                        fastTryList = fastTryList.slice(1)
                    }
                    break;
                } else {
                    //查询失败了，需要重新订座
                    break;
                }
            } else {
                _log("预定成功！", kd);
                canExit = true;
                break;
            }
        }
    }

    _log("已停止");
    stop();
}


function start() {
    document.getElementById('tool-examLevel').disabled = true;
    document.getElementById('tool-changeSeat').disabled = true;
    document.getElementById('tool-fastTryAddr').disabled = true;
    document.getElementById('tool-targetAddr').disabled = true;
    document.getElementById('tool-start').disabled = true;
    document.getElementById('tool-stop').disabled = false;
    document.getElementById("tool-chkImg").src = "";
    document.getElementById("tool-chkImgAns").value = "";

    _clearLog();
    canExit = false;
    loop();
}

function stop() {
    canExit = true;
    document.getElementById('tool-examLevel').disabled = false;
    document.getElementById('tool-changeSeat').disabled = false;
    document.getElementById('tool-fastTryAddr').disabled = false;
    document.getElementById('tool-targetAddr').disabled = false;
    document.getElementById('tool-start').disabled = false;
    document.getElementById('tool-stop').disabled = true;
    document.getElementById("tool-chkImg").src = "";
    document.getElementById("tool-chkImgAns").value = "";
    if (chkImgAnsPromise) {
        chkImgAnsPromise("EXIT");
        chkImgAnsPromise = null;
    }
}
