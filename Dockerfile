FROM alpine:3.16

# install needed packages
RUN apk update && apk add \
    make \
    nodejs \ 
    npm \
    php8 \
    php8-ctype

# setup project directories
RUN mkdir -p /home/dithermark
WORKDIR /home/dithermark

# install npm dependencies
ADD package.json .
ADD package-lock.json .
Run npm install

# install project
ADD . .
RUN make setup
RUN make

# expose server port
EXPOSE 3000

CMD ["php", "-S", "0.0.0.0:3000", "-t", "public_html"]
