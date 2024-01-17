//This class represents the intersections between edges
class Node extends GraphElement {
    constructor(x, y, id) {
        super(id);
        this.endPoint = false;
        this.elementType = "Node"
        this.x = x, this.y = y;

        this.edges = [null, null, null, null];

        this.deadEnd = false;
        this.connected = false;
    }

    spreadConnectedness(connectedNodes){
        this.connected = true;
        connectedNodes.push(this);
        this.edges.forEach(edge => {
            let otherNode = edge?.otherNode(this);
            if(edge && !edge.otherNode(this).connected && edge.numberRestraint?.number != false && !otherNode.deadEnd){
                edge.otherNode(this).spreadConnectedness(connectedNodes);
            }
        });
    }

    checkDeadEnd() {
        if (this.endPoint || this.deadEnd) {
            return;
        }

        if(this.numberRestraint?.number == 0){
            this.deadEnd = true;
            return;
        }

        let numEdges = this.edges.filter(edge => 
            edge && edge.numberRestraint?.number !== 0 && !edge.otherNode(this).deadEnd
        ).length;
        if (this.numberRestraint?.number === 0 || numEdges < 2) {
            this.deadEnd = true;
            this.edges.forEach(edge => edge?.otherNode(this).checkDeadEnd());
        }
    }

    draw(){
        if(this.deadEnd || !this.connected){
            return;
        }
        let color = getElementColor(this.timesCrossed);

        let loc = this.ScreenLoc();
        let graphics = graphicsLayers.nodes;
        if(this.endPoint){
            graphics.fillStyle(color, 1).fillCircle(loc[0], loc[1], edgeWidth);
        } else {
            let topleft = [loc[0] - edgeWidth/2, loc[1] - edgeWidth/2];
            graphics.fillStyle(color, 1);
            graphics.fillRect(...topleft, edgeWidth, edgeWidth);
            graphics = graphicsLayers.elementBorders;
            graphics.fillStyle(0x000000, 1);
            topleft[0] -= edgeWidth * ((innerBorderMultiplier - 1) / 2);
            topleft[1] -= edgeWidth * ((innerBorderMultiplier - 1) / 2);
            let innerBorderSize = edgeWidth * innerBorderMultiplier;
            graphics.fillRect(...topleft, innerBorderSize, innerBorderSize)
        }

        this.drawRestraints();
    }

    drawPlayer(lastDir){
        let loc = this.ScreenLoc();
        let graphics = graphicsLayers.player;
        graphics.fillStyle(0x0000FF, 1).fillCircle(loc[0], loc[1], edgeWidth / 1.3);
    }

    drawRestraints() {
        let graphics = graphicsLayers.numberRestraints;
        let color, loc;

        if (this.numberRestraint) {
            if(this.numberRestraint.number == 0){
                color = 0xDF1414;
            } else {
                color = getElementColor(this.numberRestraint.number);
            }
        } else {
            color = 0x000000;
        }

        loc = this.ScreenLoc();

        //Draw the restraint borders
        let squareSize = edgeWidth * borderMultiplier;
        let squareX = loc[0] - squareSize / 2;
        let squareY = loc[1] - squareSize / 2;

        graphics.fillStyle(color, 1.0);
        graphics.fillRect(squareX, squareY, squareSize, squareSize);
    }
    
    reset(){
        this.deadEnd = false;
        this.timesCrossed = 0;
        this.numberRestraint = null;
        this.totalRestraints = 0;
        this.endPoint = false
    }

    addRestraints(){
        this.numberRestraint = new NumberRestraint(this);
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