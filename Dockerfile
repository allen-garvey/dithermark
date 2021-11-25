FROM alpine:3.15

######### install needed packages
RUN apk update && apk add \
    make \
    nodejs \ 
    npm \
    php7 \
    php7-json \
    php7-ctype

######### setup project directories
RUN mkdir -p /home/dithermark
WORKDIR /home/dithermark
ADD . .

######### install project
RUN make install
RUN make

######### expose server port
EXPOSE 3000

CMD ["php", "-S", "0.0.0.0:3000", "-t", "public_html"]
