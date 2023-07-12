class GraphElement {
    constructor() {
        this.timesCrossed = 0
        this.maxCrosses = 1
    }

    // static dirBetween(from, to){
    //     let fromLoc = from.GridLoc();
    //     let toLoc = to.GridLoc();
    //     if (!fromLoc || !toLoc){
    //         console.log("dirBetween called with invalid nodes")
    //         return;
    //     }
        
    //     let xDelta = toLoc[0] - fromLoc[0];
    //     let yDelta = toLoc[1] - fromLoc[1];

    //     //If the two nodes are not adjacent, there's a problem
    //     if (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1 || xDelta + yDelta == 0){
    //         console.log("dirBetween called on non-adjacent nodes")
    //     } 
    // }

    uncross(){
        if(this.timesCrossed > 0){
            this.timesCrossed--;
        }
    }

    cross(){
        if(!this.canCross) {
            return false
        } 

        this.timesCrossed++;
        return true;
    }

    canCross(){
        //cross and cancross are separate because they will probably get more complicated later
        if(this.timesCrossed < this.maxCrosses){
            return true
        } else {
            return false
        }
    }
}