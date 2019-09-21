<template>
    <el-tree 
        :data=allData
        default-expand-all
        :render-content="render"
        :expand-on-click-node="false"
    >
    </el-tree>
</template>
<script>
import _ from 'lodash'
export default {
    props:{
        data:{
            type:Array,
            default:()=>[]
        },
        directoryDrop:Array,
        fileDrop:Array,
        deleteFn: Function,
        renameFn: Function
    },
    data () {
        return {
            allData: [],
            // 默认当前点击了谁的的修改
            currentId: '', 
            // 当前编辑的内容
            currentContent: ''
        }
    },
    methods: {
        isParent (data) {
            return data.type === 'parent'
        },
        remove(id) {
            let tmpData = _.cloneDeep(this.data)
            let filterData = tmpData.filter(item => item.id !== id)
            // 告诉父亲同步数据
            this.$emit('update:data', filterData)
            this.$message({type:'success', message:'删除成功'})
        },
        rename(id, newName) {
            let tmpData = _.cloneDeep(this.data)
            let currentData = tmpData.find(item => item.id === id)
            currentData.name = this.currentContent
            this.currentId = ''
            this.$emit('update:data', tmpData)
            this.$message({type:'success', message:'修改成功'})
        },
        handleRename(data){
            this.currentId = data.id
            this.currentContent = data.name
        },
        handleRemove(data){
            this.$confirm(`确认删除该文件${data.name}?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=> {
                // 不能直接将数据删除 需要调用用户的删除方法
                // 如果用户传递了deletefn 方法 可以直接调用
                this.deleteFn ? this.deleteFn(data.id).then((id) => {
                    this.remove(id)
                }):this.remove(data.id)
            }).catch(()=> {
                this.$message({type:'info', message:'已取消'})
            })
        },
        ok (data) {
            this.renameFn ? this.renameFn(data.id, this.currentContent).then((id,newName) => {
                this.rename(id,newName)
            }) : this.rename(data.id, this.currentContent)
        },
        cancel () {
            this.currentId = '' 
        },
        handleInput (v) {
            this.currentContent = v
        },
        handleCommand (data, value) {
            console.log('1',data, value)
            if (value === 'rn') {
                this.handleRename(data)
            } else if(value==='rm'){
                this.handleRemove(data)
            }
        },
        render (h, {node, data, store}) {
            console.log(node)
            let isParent = this.isParent(data) 
            let list = isParent ? this.directoryDrop : this.fileDrop
            let isCurrentId = data.id === this.currentId
            return (<div style={{width: '100%'}}>
                {
                    isParent ?
                    node.expanded ?
                        <i class="el-icon-folder-opened"></i>:
                        <i class="el-icon-folder"></i>:
                        <i class="el-icon-document"></i>
                }

                {isCurrentId ? <el-input value={this.currentContent} on-input={this.handleInput}></el-input> : data.name}
                
                {/* 因jsx中事件监听用on-xxx, 所以@command使用on-command
                使用bind 将当前项数据作为handCommand的第一个参数
                bind绑定时会把原来的参数数据向后移动
                */}
                {
                    !isCurrentId ?
                    <el-dropdown placement="bottom-start" trigger="click" on-command={this.handleCommand.bind(this, data)}>
                        <span class="el-dropdown-link"><i class="el-icon-arrow-down el-icon--right"></i></span>
                        <el-dropdown-menu slot="dropdown">
                            {list.map(item => (<el-dropdown-item command={item.value}>{item.text}</el-dropdown-item>))}
                        </el-dropdown-menu>
                    </el-dropdown> :
                    <span style={{float: 'right'}}>
                        <el-button type="text" on-click={this.ok.bind(this, data)}>确定</el-button>
                        <el-button type="text" on-click={this.cancel}>取消</el-button>
                    </span>

                }
            </div>)
        },
        transformData () {
            let AllData = _.cloneDeep(this.data)
            let treeMap = AllData.reduce((memo, current) => {
                memo[current['id']] = current
                return memo
            }, {})
            let result = AllData.reduce((arr, current) => {
                let pid = current.pid
                let parent = treeMap[pid]

                if (parent) {
                    parent.children ? parent.children.push(current) : parent.children = [current]
                } else if (pid === 0) {
                    arr.push(current)
                }
                return arr
            }, [])
            console.log(result)
            this.allData = result
        }
    },
    watch: {
        // 监控父组件传递的data属性，如果有更新，重新渲染
        data () {
            this.transformData()
        }
    },
    mounted () {
        this.transformData()
    }
}
</script>

<style>
.el-tree {
    margin-top:25px;
    width: 50%;
}
.el-dropdown {
    float:right;
}
.el-tree .el-tree-node__content {
    height: 32px;
}
.el-tree .el-input {
    width: 50%;
}
</style>