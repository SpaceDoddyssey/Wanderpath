class Edge extends GraphElement {
    constructor(from, to) {
        super();
        
        this.from = from;
        this.to = to; //These are Nodes   
    }

    ScreenLoc(){
        let fromLoc = this.from.ScreenLoc();
        let toLoc = this.to.ScreenLoc();
        let x = (fromLoc[0] + toLoc[0]) / 2
        let y = (fromLoc[1] + toLoc[1]) / 2
        return [x, y]
    }

    addRandomRestraint(){
        if(this.numberRestraint == -1){
            this.numberRestraint = this.timesCrossed;
            return true
        }
        return false
    }

    otherNode(node){
        if(node == this.from) return this.to
        if(node == this.to) return this.from
        console.log("otherNode called with invalide node")
        return
    }
}