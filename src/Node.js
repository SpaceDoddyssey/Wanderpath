//This class represents the intersections between edges
class Node extends GraphElement {
    constructor(x, y, id) {
        super(id);
        this.endPoint = false;
        this.elementType = "Node"
        this.x = x, this.y = y;

        this.edges = [null, null, null, null];
    }

    draw(){
        let color = getElementColor(this.timesCrossed);

        let loc = this.ScreenLoc();
        if(this.endPoint){
            graphics.fillStyle(color, 1).fillCircle(loc[0], loc[1], edgeWidth * 1.333)  
        } else {
            graphics.fillStyle(color, 1).fillRect(loc[0] - edgeWidth/2, loc[1] - edgeWidth/2, edgeWidth, edgeWidth)
        }
    }

    drawPlayer(lastDir){
        let loc = this.ScreenLoc();
        graphics.fillStyle(0x0000FF, 1).fillCircle(loc[0], loc[1], edgeWidth / 1.3)
    }

    drawRestraints() {
        if (this.numberRestraint != null) {
            restraintTexts.push(scene.add.text(
                this.ScreenLoc()[0], 
                this.ScreenLoc()[1] + 1, 
                this.numberRestraint.number, 
                restraintConfig
            ).setOrigin(0.5, 0.55));
        }
    }

    reset(){
        this.timesCrossed = 0;
        this.numberRestraint = null;
        this.totalRestraints = 0;
        this.endPoint = false
    }

    addRestraints(){
        if(this.numberRestraint == null){
            this.numberRestraint = new NumberRestraint(this);
            // this.numberRestraint = this.timesCrossed;
            this.totalRestraints++;
        }
    }

    tempRemoveRestraint(type){ //type is unused here, but used in Edge
        this.storedRestraint = this.numberRestraint;
        this.numberRestraint = null;
    }

    restoreRestraint(type){ //type is unused here, but used in Edge
        this.numberRestraint = this.storedRestraint;
    }

    GridLoc(){
        return [this.x, this.y]
    }

    ScreenLoc(){
        let x = borderPaddingLeft + (sizePerUnit * this.x) + sizePerUnit/2;
        let y = borderPaddingTop + (sizePerUnit * this.y) + sizePerUnit/2;
        return [x, y]
    }

    connectEdge(toNode, dir, id){
        let edge = new Edge(this, toNode, id)
        
        this.edges[dir] = edge
        toNode.edges[InverseDirs[dir]] = edge

        return edge
    }
}