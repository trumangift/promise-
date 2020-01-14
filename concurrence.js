// race实现并发控制
var urls = [
    'https://www.kkkk1000.com/images/getImgData/getImgDatadata.jpg', 
    'https://www.kkkk1000.com/images/getImgData/gray.gif', 
    'https://www.kkkk1000.com/images/getImgData/Particle.gif', 
    'https://www.kkkk1000.com/images/getImgData/arithmetic.png', 
    'https://www.kkkk1000.com/images/getImgData/arithmetic2.gif', 
    'https://www.kkkk1000.com/images/getImgData/getImgDataError.jpg', 
    'https://www.kkkk1000.com/images/getImgData/arithmetic.gif', 
    'https://www.kkkk1000.com/images/wxQrCode2.png'
    ];
    function limitLoad(urls, handler, limit) {
        // 对数组做一个拷贝
        const sequence = [].concat(urls)
        let promises = [];
    
        //并发请求到最大数
        promises = sequence.splice(0, limit).map((url, index) => {
            // 这里返回的 index 是任务在 promises 的脚标，
            //用于在 Promise.race 之后找到完成的任务脚标
            return handler(url).then(() => {
                return index
            });
        });
    
        (async function loop() {
            let p = Promise.race(promises);
            for (let i = 0; i < sequence.length; i++) {
                p = p.then((res) => {
                    promises[res] = handler(sequence[i]).then(() => {
                        return res
                    });
                    return Promise.race(promises)
                })
            }
        })()
    }

    // promise + async实现并发控制
        function loadImg(url, i) {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.onload = function () {
                    console.log(i+ '张图片加载完成');
                    resolve();
                }
                img.onerror = reject
                img.src = url
            })
        };
        // 并发数量
        var concurrence = 2;
        // 计数器
        var count = 0;
        // 全局锁
        var lock = [];
        var l = urls.length;
        // 阻塞函数
        function block(){
            let _resolve;
            return  new Promise((resolve,reject)=>{
                _resolve=resolve;
                // resolve不执行,将其推入lock数组;
                lock.push(_resolve);
            });
        }
        // 叫号机
        function next(){
            lock.length&&lock.shift()()
        }
        async function bao(i){
            if(count>=concurrence){
                //超过限制利用await和promise进行阻塞;
                await block();
            }
            if(urls.length>0){
                console.log("执行："+ i) 
                count++
                await loadImg(urls.shift(), i);
                count--;
                next()
            }
        }
        for (let i = 0; i < l; i++) {
            bao(i);
        }