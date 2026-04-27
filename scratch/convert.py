
import re
import sys

def convert_html_to_jsx(html_file, output_file):
    with open(html_file, "r", encoding="utf-8") as f:
        html = f.read()
    
    match = re.search(r"<body>(.*?)</body>", html, re.DOTALL)
    if match:
        html = match.group(1)
        
    html = html.replace("class=", "className=")
    html = html.replace("src=\"./public/", "src=\"/")
    html = re.sub(r"(<img[^>]*?[^/])>", r"\1 />", html)
    html = re.sub(r"(<input[^>]*?[^/])>", r"\1 />", html)
    html = html.replace("<br>", "<br/>")

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html)

if __name__ == "__main__":
    convert_html_to_jsx(sys.argv[1], sys.argv[2])

