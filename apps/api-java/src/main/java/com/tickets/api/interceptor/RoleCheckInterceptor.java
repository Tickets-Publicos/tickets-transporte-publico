package com.tickets.api.interceptor;

import com.tickets.api.annotation.RequireRole;
import com.tickets.api.model.enums.UserRole;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

/**
 * Interceptor que verifica se o usuário tem a role necessária
 * para acessar endpoints anotados com @RequireRole
 */
@Component
public class RoleCheckInterceptor implements HandlerInterceptor {

  @Override
  public boolean preHandle(@NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull Object handler) throws Exception {

    if (!(handler instanceof HandlerMethod)) {
      return true;
    }

    HandlerMethod handlerMethod = (HandlerMethod) handler;
    RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);

    if (requireRole == null) {
      // Sem restrição de role
      return true;
    }

    // Verifica se o usuário está autenticado
    Boolean authenticated = (Boolean) request.getAttribute("authenticated");
    if (authenticated == null || !authenticated) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.setContentType("application/json");
      response.getWriter().write("{\"error\":\"Não autenticado\"}");
      return false;
    }

    // Verifica a role do usuário
    String userRoleStr = (String) request.getAttribute("userRole");
    UserRole[] allowedRoles = requireRole.value();

    if (userRoleStr == null) {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.setContentType("application/json");
      response.getWriter().write("{\"error\":\"Role do usuário não encontrada\"}");
      return false;
    }

    // Converte a role do usuário de String para enum
    UserRole userRole;
    try {
      userRole = UserRole.valueOf(userRoleStr);
    } catch (IllegalArgumentException e) {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.setContentType("application/json");
      response.getWriter().write("{\"error\":\"Role do usuário inválida\"}");
      return false;
    }

    // Verifica se a role do usuário está na lista de roles permitidas
    boolean hasAccess = Arrays.asList(allowedRoles).contains(userRole);

    if (!hasAccess) {
      String allowedRolesStr = Arrays.stream(allowedRoles)
          .map(Enum::name)
          .reduce((a, b) -> a + " ou " + b)
          .orElse("");

      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.setContentType("application/json");
      response.getWriter().write("{\"error\":\"Acesso negado. Role necessária: "
          + allowedRolesStr + "\"}");
      return false;
    }

    return true;
  }
}
