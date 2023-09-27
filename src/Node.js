//This class represents the intersections between edges
class Node extends GraphElement {
    constructor(x, y, id) {
        super(id);

        this.endPoint = false;
        
        this.elementType = "Node"

        this.x = x, this.y = y;
                            
        this.edges = [null, null, null, null];
    }

    reset(){
        this.timesCrossed = 0;
        this.numberRestraint = -1;
        this.totalRestraints = 0;
        this.endPoint = false
    }

    addRestraints(){
        //This will be more complicated once other types of restraints are added
        if(this.numberRestraint == -1){
            this.numberRestraint = this.timesCrossed;
            this.totalRestraints++;
        }
    }

    GridLoc(){
        return [this.x, this.y]
    }

    ScreenLoc(){
        let x = borderPadding + (sizePerUnit * this.x) + sizePerUnit/2;
        let y = borderPadding + 20 + (sizePerUnit * this.y) + sizePerUnit/2;
        return [x, y]
    }

    connectEdge(toNode, dir, id){
        let edge = new Edge(this, toNode, id)
        
        this.edges[dir] = edge
        toNode.edges[InverseDirs[dir]] = edge

        return edge
    }
}