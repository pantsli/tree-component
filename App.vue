<template>
    <div>
       <MyTree 
       v-if="data.length" 
       :fileDrop="fileDrop"
       :directoryDrop="directoryDrop"
       :deleteFn="deleteFn"
       :renameFn="renameFn"
       :data.sync="data"></MyTree>
    </div>
</template>


<script>
    import {getTreeList} from './api'
    import MyTree from './MyTree.vue'
    export default {
        data () {
            return {
                data:[],
                fileDrop: [
                    {value:'rm', text:'删除文件'}
                ],
                directoryDrop: [
                    {value:'rn',text:'修改名字'},
                    {value:'rm', text:'删除文件夹'}
                ]
            }
        },
        components: {MyTree},
        methods: {
            deleteFn (id) {
                console.log('delete data, id', id)
                return new Promise((resolve,reject) =>{
                    setTimeout(()=> {
                        resolve(id)
                    }, 2000)
                })
            },
            renameFn(id, newName) {
                console.log('rename data, id', id)
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(id, newName)
                    }, 2000)
                })
            }
        },
        async mounted() {
            let {data} = await getTreeList()
            data.parent.forEach(p => p.type = 'parent')
            this.data = [...data.parent, ...data.child]
        }
        
    }
</script>