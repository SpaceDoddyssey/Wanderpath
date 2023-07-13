//This class represents the intersections between edges
class Node extends GraphElement {
    constructor(x, y) {
        super();

        this.endPoint = false;
        
        this.x = x, this.y = y;
                            
        this.edges = [null, null, null, null];

        this.numberRestraint = -1;
    }


    addRandomRestraint(){
        if(this.numberRestraint == -1){
            this.numberRestraint = this.timesCrossed;
            return true
        }
        return false
    }


    GridLoc(){
        return [this.x, this.y]
    }

    ScreenLoc(){
        let x = borderPadding + (sizePerUnit * this.x) + sizePerUnit/2;
        let y = borderPadding + UIspacerheight + (sizePerUnit * this.y) + sizePerUnit/2;
        return [x, y]
    }

    connectEdge(toNode, dir){
        let edge = new Edge(this, toNode)
        
        this.edges[dir] = edge
        toNode.edges[InverseDirs[dir]] = edge

        return edge
    }
}