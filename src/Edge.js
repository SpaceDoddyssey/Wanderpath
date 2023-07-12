class Edge extends GraphElement {
    constructor(from, to) {
        super();
        
        this.from = from;
        this.to = to; //These are Nodes   
    }

    otherNode(node){
        if(node == this.from) return this.to
        if(node == this.to) return this.from
        console.log("otherNode called with invalide node")
        return
    }
}