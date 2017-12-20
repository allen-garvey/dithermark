#based on: https://github.com/tromero/BayerMatrix/blob/master/MakeBayer.py

def InitBayer(x, y, size, value, step,
              matrix = [[]]):
    if matrix == [[]]:
        matrix = [[0 for i in range(size)]for i in range(size)]
    
    if (size == 1):
        matrix[y][x] = value
        return
    
    half = size/2
    
    #subdivide into quad tree and call recursively
    #pattern is TL, BR, TR, BL
    InitBayer(x,      y,      half, value+(step*0), step*4, matrix)
    InitBayer(x+half, y+half, half, value+(step*1), step*4, matrix)
    InitBayer(x+half, y,      half, value+(step*2), step*4, matrix)
    InitBayer(x,      y+half, half, value+(step*3), step*4, matrix)
    return matrix
        
def InitBayerHelper(matrixSize):
    return InitBayer(0, 0, matrixSize, 0, 1)


def printMatrix(matrix):
    for row in matrix:
        for column in row:
            print(column)
            
def printSortedMatrix(matrix):
    flat_list = [item for sublist in matrix for item in sublist]
    for item in sorted(flat_list):
        print(item)


if __name__ == '__main__':
    matrix = InitBayerHelper(16)
    printMatrix(matrix)
    