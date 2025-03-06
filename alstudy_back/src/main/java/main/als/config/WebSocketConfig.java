package main.als.config;

import lombok.RequiredArgsConstructor;
import main.als.websocket.util.StompExceptionHandler;
import main.als.websocket.util.StompHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


    private final StompHandler stompHandler;
    private final StompExceptionHandler stompExceptionHandler;

    @Value("${rabbitmq.host}")
    private String rabbitMqHost;

    @Value("${rabbitmq.user}")
    private String rabbitMqUser;

    @Value("${rabbitmq.password}")
    private String rabbitMqPassword;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry){
        registry.setApplicationDestinationPrefixes("/pub")
                .enableStompBrokerRelay("/topic")
                .setRelayHost(rabbitMqHost)
                .setVirtualHost("/")
                .setRelayPort(61613)
                .setClientLogin(rabbitMqUser)
                .setClientPasscode(rabbitMqPassword)

        ;

    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .setErrorHandler(stompExceptionHandler)
                .addEndpoint("/ws")
                .setAllowedOrigins("*")





        ;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {

        registration.interceptors(stompHandler);
    }


}
