//This class represents the intersections between edges
class Node extends GraphElement {
    constructor(x, y) {
        super();
        
        this.x = x, this.y = y;
                            
        this.edges = [null, null, null, null];
    }

    Loc(){
        let x = borderPadding + (sizePerUnit * this.x) + sizePerUnit/2;
        let y = borderPadding + UIspacerheight + (sizePerUnit * this.y) + sizePerUnit/2;
        return [x, y]
    }
}