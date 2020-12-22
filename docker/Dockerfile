FROM alpine:3.12

# nginx with php-fpm config from https://wiki.alpinelinux.org/wiki/Nginx_with_PHP

#########install needed packages
RUN apk update
RUN apk add make git nodejs npm nginx php7 php7-fpm php7-json php7-ctype

#########configure user for nginx
RUN adduser -D -g 'www' www
RUN mkdir /www
RUN chown -R www:www /var/lib/nginx
RUN chown -R www:www /www

#########edit nginx configuration
WORKDIR /etc/nginx/
RUN mv nginx.conf nginx.conf.original
COPY nginx.conf .

#########setup project directories
RUN mkdir -p /home/dithermark/Sites

#########install project
WORKDIR /home/dithermark/Sites
RUN git clone https://github.com/allen-garvey/dithermark.git

WORKDIR /home/dithermark/Sites/dithermark
RUN make install
RUN make

#########expose server port
EXPOSE 80

#########startup script to start nginx and php-fpm
WORKDIR /bin
COPY start.sh .
RUN chmod +x start.sh
CMD ["start.sh"]
