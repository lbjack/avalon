/**
 * ------------------------------------------------------------
 * diff 对比新旧两个虚拟DOM树,根据directive中的diff方法为新虚拟DOM树
 * 添加change, afterChange更新钩子
 * ------------------------------------------------------------
 */
var emptyArr = []
// 防止被引用
var emptyObj = function () {
    return {
        children: [], props: {}
    }
}
var directives = avalon.directives
var rbinding = require('../seed/regexp').binding

function diff(current, previous) {
    for (var i = 0; i < current.length; i++) {
        var cur = current[i]
        var pre = previous[i] || emptyObj()
    
        switch (cur.nodeType) {
            case 3:
                if (!cur.skipContent) {
                    directives.expr.diff(cur, pre)
                }
                break
            case 8:
                if (cur.directive) {
                    directives[cur.directive].diff(cur, pre,
                    current[i+1],previous[i+1])
                }
                break
            case 1:
                if (!cur.skipAttrs) {
                    diffProps(cur, pre)
                }
                if (!cur.skipContent && !cur.isVoidTag ) {
                    diff(cur.children, pre.children || emptyArr, cur)
                }
                if(pre.afterChange){
                    execHooks(pre, cur.afterChange)
                }
                break
            default: 
                if(Array.isArray(cur)){
                   diff(cur, pre)
                }
                break
        }
    }
}

function execHooks(el, hooks) {
    if (hooks.length) {
        for (var hook; hook = hooks[i++];) {
           hook(el)
        }
    }
    delete el.afterChange
}

function diffProps(current, previous) {
    if (current.order) {
        var directiveType
        try {
            current.order.replace(/([^;]+)/g, function (name) {
                var match = name.match(rbinding)
                var type = match && match[1]
                directiveType = type
                if (directives[type]) {
                    directives[type].diff(current, previous || emptyObj(), name)
                }
                return name
            })
        } catch (e) {
            avalon.log(directiveType, e, e.message, 'diffProps error')
        }
    }


}
avalon.diffProps = diffProps
module.exports = diff
