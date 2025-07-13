#version 300 es
//high int precision required for bitwise functions to work on mobile devices
precision highp int;

#{{bitwiseFunctions}}

float aDitherMask1(int x, int y){
    return float(AND(XOR(x, y * 149) * 1234, 511)) / 511.0;
}

float aDitherMask2(int x, int y, int c){
    return float(AND(XOR(x + (c * 17), y * 149) * 1234, 511)) / 511.0;
}

float aDitherMask3(int x, int y){
    return float(AND((x + (y * 237)) * 119,  255)) / 255.0;
}

float aDitherMask4(int x, int y, int c){
    return float(AND(((c * 67 + x) + (y * 236)) * 119, 255)) / 255.0;
}

float arithmeticDither(vec2 pos, vec3 pixel){
    int x = int(pos.x);
    int y = int(pos.y);
    return #{{arithmeticDitherReturn}};
    //(e.g.) aDitherMask3(x, y);
}