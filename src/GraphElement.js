class GraphElement {
    constructor() {
        this.timesCrossed = 0
        this.maxCrosses = 1
    }

    attemptCross(){
        if(this.timesCrossed < this.maxCrosses){
            this.timesCrossed++
            return true
        } else {
            return false
        }
    }
}