def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def build():
    html = read_file("src/index.html")
    css = f"<style>\n{read_file('src/style.css')}</style>"
    js = f"<script>\n{read_file('src/code.js')}</script>"

    html = html.replace('<link rel="stylesheet" href="style.css">', css)
    html = html.replace('<script src="code.js"></script>', js)

    write_file("single_page/simple_html_collage_maker.html", html)

if __name__ == "__main__":
    build()