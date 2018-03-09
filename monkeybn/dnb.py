import sys
from antlr4 import *
from DNBLexer import DNBLexer
from DNBParser import DNBParser
from DNBVisitor import DNBVisitor
from PIL import Image, ImageDraw
from pprint import pprint

class DNBPlotter(DNBVisitor):
    def __init__(self):
        self.width = 100
        self.height = 100
        self.paper_color = 0
        self.image = Image.new('L', (self.width, self.height), color=self.paper_color)
        self.pen_color = 255
        self.variables = {}

    def visitPlot(self, ctx):
        self.visitChildren(ctx)
        return self.image

    def visitPaperCmd(self, ctx):
        self.paper_color = int(ctx.color().getText())
        self.image = Image.new('L', (self.width, self.height), color=self.paper_color)

    def visitSizeCmd(self, ctx):
        self.width = int(ctx.coord()[0].getText())
        self.height = int(ctx.coord()[1].getText())
        self.image = Image.new('L', (self.width, self.height), color=self.paper_color)

    def visitLineCmd(self, ctx):
        def handleCoord(coord):
            if coord.NUMBER():
                return int(coord.getText())
            elif coord.NAME():
                return self.variables[coord.getText()]        

        coords = [handleCoord(coord) for coord in ctx.coord()]
        
        draw = ImageDraw.Draw(self.image)
        draw.line((coords[0], coords[1], coords[2], coords[3]), fill=self.pen_color)
        del draw

    def visitPenCmd(self, ctx):
        if ctx.color().NUMBER():
            self.pen_color = int(ctx.color().getText())
        elif ctx.color().NAME():
            self.pen_color = self.variables[ctx.color().getText()] 

    def visitRepeatCmd(self, ctx):
        varname = ctx.NAME().getText()
        fromIndex = int(ctx.fromIndex().getText())
        self.variables[varname] = fromIndex

        toIndex = int(ctx.toIndex().getText())        
        commands = ctx.command()
        for index in range(fromIndex, toIndex):
            self.variables[varname] = index
            for command in commands:
                self.visitCommand(command)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        input_stream = FileStream(sys.argv[1])
    else:
        input_stream = InputStream(sys.stdin.read())

    lexer = DNBLexer(input_stream)
    tStream = CommonTokenStream(lexer)
    parser = DNBParser(tStream)
    ast = parser.plot()

    sys.stderr.write(ast.toStringTree(recog=parser))
    sys.stderr.write('\n')

    visitor = DNBPlotter()
    image = visitor.visit(ast)
    image.save(sys.stdout.buffer, "PNG")

