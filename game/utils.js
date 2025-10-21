function boxesIntersect(boxA, boxB) {
    return (boxA.x < boxB.x + boxB.width &&
            boxA.x + boxA.width > boxB.x &&
            boxA.y < boxB.y + boxB.height &&
            boxA.y + boxA.height > boxB.y);
}

function distance(p1, p2)
{
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export { boxesIntersect, distance};