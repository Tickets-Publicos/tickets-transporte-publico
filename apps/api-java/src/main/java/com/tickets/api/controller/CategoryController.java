package com.tickets.api.controller;

import com.tickets.api.annotation.RequireRole;
import com.tickets.api.dto.category.CategoryResponseDto;
import com.tickets.api.dto.category.CreateCategoryDto;
import com.tickets.api.model.enums.UserRole;
import com.tickets.api.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

  private final CategoryService categoryService;

  /**
   * Cria uma nova categoria.
   * Apenas administradores podem criar categorias.
   */
  @RequireRole({ UserRole.ADMIN })
  @PostMapping
  public ResponseEntity<CategoryResponseDto> create(@Valid @RequestBody CreateCategoryDto dto) {
    CategoryResponseDto created = categoryService.create(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  /**
   * Lista todas as categorias.
   * Qualquer usuário autenticado pode listar categorias.
   */
  @GetMapping
  public ResponseEntity<List<CategoryResponseDto>> findAll() {
    return ResponseEntity.ok(categoryService.findAll());
  }

  /**
   * Busca uma categoria por ID.
   * Qualquer usuário autenticado pode visualizar categorias.
   */
  @GetMapping("/{id}")
  public ResponseEntity<CategoryResponseDto> findById(@PathVariable String id) {
    return ResponseEntity.ok(categoryService.findById(id));
  }

  /**
   * Atualiza uma categoria.
   * Apenas administradores podem atualizar categorias.
   */
  @RequireRole({ UserRole.ADMIN })
  @PatchMapping("/{id}")
  public ResponseEntity<CategoryResponseDto> update(@PathVariable String id,
      @Valid @RequestBody CreateCategoryDto dto) {
    return ResponseEntity.ok(categoryService.update(id, dto));
  }

  /**
   * Deleta uma categoria.
   * Apenas administradores podem deletar categorias.
   */
  @RequireRole({ UserRole.ADMIN })
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    categoryService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
