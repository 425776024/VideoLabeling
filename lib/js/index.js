var urlsArr = [];
var tagsArr = [];
var framesArr = [];
var result = [];
var win;
var isShow = false;
var moveRight = $("#list_left").width();
var type = getUrlParam("type");
var arr = ["unTag", "taged", "checked", "delTag"];
var tab = type && arr.indexOf(type) > -1 ? "#" + type : "#unTag";
$("#myTab a.tab").click(function (e) {
    e.preventDefault();
    $(this).tab("show");
    tab = $(this)[0].hash;
});

function changeFile(e, id) {
    result = [];
    var name = "";
    if (e.files[0]) {
        name = e.files[0].name;
    }
    document.getElementById(id).value = name;
}

function handleExport(a) {
    var result = JSON.parse(localStorage.getItem("result"));
    if (result.length == 0) {
        showTip("The data is empty, unable to export", "warning", "500");
        return;
    }
    var newResult = [];
    for (var i in result) {
        for (var j in result[i].tagInfo) {
            newResult.push({
                URLID: result[i].urlId.trim(),
                URL: result[i].url.trim(),
                TagID: result[i].tagInfo[j].tagId,
                Tag: result[i].tagInfo[j].tag,
                Start: result[i].tagInfo[j].start,
                End: result[i].tagInfo[j].end,
                Time: result[i].times,
                State: result[i].state
            });
        }
    }
    var thObj = newResult[0];
    var thArr = [];
    for (var key in thObj) {
        thArr.push(key);
    }
    var thStr = thArr.join(",");

    var outputArr = [];
    outputArr.push(thStr);
    for (var i in newResult) {
        if (newResult[i].URLID && newResult[i].TagID) {
            var tdObj = newResult[i];
            var tdArr = [];
            for (var key in tdObj) {
                tdArr.push(tdObj[key]);
            }
            outputArr.push(tdArr);
        }
    }
    var str = outputArr.join("\n");
    str = encodeURIComponent(str);
    var now = new Date().format("yyyy-MM-dd_hh.mm.ss");
    a.download = "instruction_" + now + ".txt";
    a.href = "data:text/csv;charset=utf-8,\ufeff" + str;
}

function handleImport() {
    result = [];
    showTip("loading", "info");
    // must video.txt
    $("input[name=urls]").csv2arr(function (arr) {
        if (arr[0][0].trim() != "URLID" || arr[0][1].trim() != "URL") {
            showTip("Video file format error", "warning", "500");
            $("#tip").fadeOut(100);
            return;
        }
        arr.splice(0, 1);
        urlsArr = unique(arr);
        if (urlsArr.length > 0) {
            // frame.txt Optional
            $("input[name=frames]").csv2arr(function (arr) {
                if (arr.length == 0) {
                    localStorage.setItem("frame", JSON.stringify([]));
                } else {
                    if (arr[0][0].trim() != "URLID" || arr[0][1].trim() != "Frame") {
                        showTip("Frame file format error", "warning", "500");
                        $("#tip").fadeOut(100);
                    } else {
                        arr.splice(0, 1);
                        framesArr = arr.concat();
                        if (framesArr.length > 0) {
                            localStorage.setItem("frame", JSON.stringify(framesArr));
                        }
                    }
                }
            });

            // must label.txt
            $("input[name=tags]").csv2arr(function (arr) {
                if (arr[0][0].trim() != "TagID" || arr[0][1].trim() != "Tag") {
                    showTip("Label file format error", "warning", "500");
                    $("#tip").fadeOut(100);
                    return;
                } else {
                    arr.splice(0, 1);
                    tagsArr = arr.concat();
                    console.log("tagsArr:");
                    console.log(tagsArr);
                    if (tagsArr.length > 0) {
                        localStorage.setItem("tag", JSON.stringify(tagsArr));
                    }
                }
            });

            // history.txt Optional
            // URLID,URL,TagID,Tag,Start,End,Time,State
            $("input[name=historys]").csv2arr(function (arr) {
                if (arr.length > 0) {
                    if (arr[0][0].trim() != "URLID" || arr[0][1].trim() != "URL"
                        || arr[0][2].trim() != "TagID" || arr[0][3].trim() != "Tag"
                        || arr[0][4].trim() != "Start" || arr[0][5].trim() != "End"
                        || arr[0][6].trim() != "Time" || arr[0][7].trim() != "State") {
                        showTip("History file format error", "warning", "500");
                        $("#tip").fadeOut(100);
                    } else {
                        arr.splice(0, 1);
                        var historyArr = arr.concat();
                        if (historyArr.length > 0) {
                            initTable();
                            result = []
                            var tmp_dic = new Array();
                            var temp_result = createTable(urlsArr);
                            for (var hi in historyArr) {
                                // URLID,URL,TagID,Tag,Start,End,Time,State
                                var his = historyArr[hi];
                                var urlId = his[0];
                                var url = his[1];

                                var TagID = his[2];
                                var Tag = his[3];
                                // var Start = parseFloat(his[4]);
                                // var End = parseFloat(his[5]);
                                var Start = his[4];
                                var End = his[5];
                                var Time = parseInt(his[6]);
                                var State = parseInt(his[7]);
                                var target = {
                                    tagId: TagID,
                                    tag: Tag,
                                    start: Start,
                                    end: End
                                };

                                if (tmp_dic.hasOwnProperty(urlId)) {
                                    tmp_dic[urlId].tagInfo.push(target);
                                } else {
                                    tmp_dic[urlId] = {
                                        urlId: urlId,
                                        url: url,
                                        tagInfo: [target],
                                        times: 0,
                                        state: 0
                                    };
                                }
                            }
                            // 合并result
                            for (var ti in temp_result) {
                                var tp_res = temp_result[ti];
                                if (tmp_dic.hasOwnProperty(tp_res.urlId)) {

                                } else {
                                    tmp_dic[tp_res.urlId] = tp_res;
                                }
                            }

                            for (var key in tmp_dic) {
                                result.push(tmp_dic[key]);
                            }
                            localStorage.setItem("result", JSON.stringify(result));
                            console.log("history:");
                            console.log(result);
                            return;
                        }
                    }
                }
            });
            initTable();
        }

    });
}

function initTable() {
    $("#unTag").html("");
    $("#taged").html("");
    $("#delTag").html("");
    // 创建数据表
    result = createTable(urlsArr);
    localStorage.setItem("result", JSON.stringify(result));
}

function handleClear(e) {
    if (confirm("Make sure to clear all ?")) {
        if (confirm("Make sure to clear all ?")) {
            localStorage.clear();
            location.reload();
        } else {

        }
    } else {

    }
}

function handleDelete(e) {
    var tr = $(e)
        .parent()
        .parent()
        .parent().prevObject[0];
    var urlId = $(tr).find("td")[0].innerText;
    for (var i in result) {
        if (result[i].urlId == parseInt(urlId)) {
            if (tab == "#unTag") {
                localStorage.setItem(
                    "unTagTotal",
                    parseInt(localStorage.getItem("unTagTotal")) - 1
                );
            } else {
                localStorage.setItem(
                    "tagedTotal",
                    parseInt(localStorage.getItem("tagedTotal")) - 1
                );
            }
            localStorage.setItem(
                "delTagTotal",
                parseInt(localStorage.getItem("delTagTotal")) + 1
            );
            $("#unTagTotal").html(localStorage.getItem("unTagTotal"));
            $("#tagedTotal").html(localStorage.getItem("tagedTotal"));
            $("#delTagTotal").html(localStorage.getItem("delTagTotal"));
            result[i].state = 2;
            localStorage.setItem("result", JSON.stringify(result));
            $(tr).remove();
            var tr = "<tr><td>" + result[i].urlId;
            tr += "<td>" + result[i].url + "</td>";
            tr += "<td>" + result[i].times + "</td>";
            tr +=
                "<td><button onclick='handleReturn(this)' class='btn btn-danger' type='button'>Restore</button></td>";
            tr += "</tr>";

            if ($("#delTag:has(tbody)").length == 0) {
                $("#delTag table").append("<tbody>" + tr + "</tbody>");
            } else {
                $("#delTag tbody").prepend(tr);
            }
            return;
        }
    }
}

function handleReturn(e) {
    var tr = $(e)
        .parent()
        .parent()
        .parent().prevObject[0];
    var urlId = $(tr).find("td")[0].innerText;
    for (var i in result) {
        if (result[i].urlId == parseInt(urlId)) {
            $(tr).remove();
            var tr = "<tr><td>" + result[i].urlId + "</td>";
            tr += "<td>" + result[i].url + "</td>";
            tr += "<td>" + result[i].times + "</td>";

            if (parseInt(result[i].times) > 0) {
                tr +=
                    "<td><button onclick='goTag(this)' class='btn btn-info'>Checkout</button><button onclick='handleDelete(this)' class='btn btn-danger' type='button'>Delete</button></td>";
                tr += "</tr>";
                localStorage.setItem(
                    "tagedTotal",
                    parseInt(localStorage.getItem("tagedTotal")) + 1
                );
                result[i].state = 1;
                if ($("#taged:has(tbody)").length == 0) {
                    $("#taged table").append("<tbody>" + tr + "</tbody>");
                } else {
                    $("#taged tbody").prepend(tr);
                }
            } else {
                tr +=
                    "<td><button onclick='goTag(this)' class='btn btn-info'>Label</button><button onclick='handleDelete(this)' class='btn btn-danger' type='button'>Delete</button></td>";
                tr += "</tr>";
                localStorage.setItem(
                    "unTagTotal",
                    parseInt(localStorage.getItem("unTagTotal")) + 1
                );
                result[i].state = 0;
                if ($("#unTag:has(tbody)").length == 0) {
                    $("#unTag table").append("<tbody>" + tr + "</tbody>");
                } else {
                    $("#unTag tbody").prepend(tr);
                }
            }

            localStorage.setItem(
                "delTagTotal",
                parseInt(localStorage.getItem("delTagTotal")) - 1
            );
            $("#unTagTotal").html(localStorage.getItem("unTagTotal"));
            $("#tagedTotal").html(localStorage.getItem("tagedTotal"));
            $("#delTagTotal").html(localStorage.getItem("delTagTotal"));
            localStorage.setItem("result", JSON.stringify(result));
            return;
        }
    }
}

$(function () {
    var param = getUrlParam("type");
    if (param) {
        $('#myTab a[href="#' + param + '"]').tab("show");
    }
    var resultLocal = JSON.parse(localStorage.getItem("result"));
    var tagsArrLocal = JSON.parse(localStorage.getItem("tag"));
    var framesArrLocal = JSON.parse(localStorage.getItem("frame"));
    if (
        resultLocal ||
        tagsArrLocal ||
        framesArrLocal ||
        resultLocal.length > 0 ||
        tagsArrLocal.length > 0 ||
        framesArrLocal.length > 0
    ) {
        urlsArr = resultLocal;
        tagsArr = tagsArrLocal;
        framesArr = framesArrLocal;
        initTable();
    }
    var unTagTotal = localStorage.getItem("unTagTotal")
        ? localStorage.getItem("unTagTotal")
        : 0;
    var tagedTotal = localStorage.getItem("tagedTotal")
        ? localStorage.getItem("tagedTotal")
        : 0;
    var checkedTotal = localStorage.getItem("checkedTotal")
        ? localStorage.getItem("checkedTotal")
        : 0;
    var delTagTotal = localStorage.getItem("delTagTotal")
        ? localStorage.getItem("delTagTotal")
        : 0;
    $("#unTagTotal").html(unTagTotal);
    $("#checkedTotal").html(checkedTotal);
    $("#tagedTotal").html(tagedTotal);
    $("#delTagTotal").html(delTagTotal);
});
