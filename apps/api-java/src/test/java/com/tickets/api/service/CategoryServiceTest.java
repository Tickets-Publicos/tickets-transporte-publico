package com.tickets.api.service;

import com.tickets.api.dto.category.CategoryResponseDto;
import com.tickets.api.dto.category.CreateCategoryDto;
import com.tickets.api.exception.ConflictException;
import com.tickets.api.exception.ResourceNotFoundException;
import com.tickets.api.model.entity.Category;
import com.tickets.api.model.enums.CategoryType;
import com.tickets.api.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_shouldSaveCategoryAndReturnDto() {
        // Arrange
        CreateCategoryDto dto = new CreateCategoryDto();
        dto.setName("Test Category");
        dto.setType(CategoryType.INFRASTRUCTURE);
        dto.setDescription("Test description");

        Category savedCategory = Category.builder()
                .id("c1")
                .name("Test Category")
                .type(CategoryType.INFRASTRUCTURE)
                .description("Test description")
                .build();

        when(categoryRepository.existsByName(dto.getName())).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(savedCategory);

        // Act
        CategoryResponseDto result = categoryService.create(dto);

        // Assert
        assertNotNull(result);
        assertEquals("c1", result.getId());
        assertEquals("Test Category", result.getName());
        assertEquals(CategoryType.INFRASTRUCTURE, result.getType());
        assertEquals("Test description", result.getDescription());
        verify(categoryRepository, times(1)).existsByName(dto.getName());
        verify(categoryRepository, times(1)).save(any(Category.class));
    }

    @Test
    void create_withExistingName_shouldThrowConflictException() {
        // Arrange
        CreateCategoryDto dto = new CreateCategoryDto();
        dto.setName("Existing Category");
        dto.setType(CategoryType.INFRASTRUCTURE);

        when(categoryRepository.existsByName(dto.getName())).thenReturn(true);

        // Act & Assert
        assertThrows(ConflictException.class, () -> categoryService.create(dto));
        verify(categoryRepository, times(1)).existsByName(dto.getName());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void findAll_shouldReturnAllCategories() {
        // Arrange
        Category cat1 = Category.builder()
                .id("c1")
                .name("Category 1")
                .type(CategoryType.INFRASTRUCTURE)
                .build();

        Category cat2 = Category.builder()
                .id("c2")
                .name("Category 2")
                .type(CategoryType.ACCESSIBILITY)
                .build();

        when(categoryRepository.findAll()).thenReturn(Arrays.asList(cat1, cat2));

        // Act
        List<CategoryResponseDto> result = categoryService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("c1", result.get(0).getId());
        assertEquals("c2", result.get(1).getId());
        verify(categoryRepository, times(1)).findAll();
    }

    @Test
    void findById_shouldReturnCategory() {
        // Arrange
        Category category = Category.builder()
                .id("c1")
                .name("Test Category")
                .type(CategoryType.INFRASTRUCTURE)
                .description("Test description")
                .build();

        when(categoryRepository.findById("c1")).thenReturn(Optional.of(category));

        // Act
        CategoryResponseDto result = categoryService.findById("c1");

        // Assert
        assertNotNull(result);
        assertEquals("c1", result.getId());
        assertEquals("Test Category", result.getName());
        assertEquals(CategoryType.INFRASTRUCTURE, result.getType());
        verify(categoryRepository, times(1)).findById("c1");
    }

    @Test
    void findById_withNonExistentId_shouldThrowResourceNotFoundException() {
        // Arrange
        when(categoryRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> categoryService.findById("nonexistent"));
        verify(categoryRepository, times(1)).findById("nonexistent");
    }

    @Test
    void update_shouldUpdateCategoryAndReturnDto() {
        // Arrange
        Category existingCategory = Category.builder()
                .id("c1")
                .name("Old Name")
                .type(CategoryType.INFRASTRUCTURE)
                .description("Old description")
                .build();

        CreateCategoryDto dto = new CreateCategoryDto();
        dto.setName("New Name");
        dto.setType(CategoryType.ACCESSIBILITY);
        dto.setDescription("New description");

        when(categoryRepository.findById("c1")).thenReturn(Optional.of(existingCategory));
        when(categoryRepository.existsByName("New Name")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        CategoryResponseDto result = categoryService.update("c1", dto);

        // Assert
        assertNotNull(result);
        assertEquals("c1", result.getId());
        assertEquals("New Name", result.getName());
        assertEquals(CategoryType.ACCESSIBILITY, result.getType());
        assertEquals("New description", result.getDescription());
        verify(categoryRepository, times(1)).findById("c1");
        verify(categoryRepository, times(1)).save(any(Category.class));
    }

    @Test
    void update_withSameName_shouldNotCheckNameConflict() {
        // Arrange
        Category existingCategory = Category.builder()
                .id("c1")
                .name("Test Category")
                .type(CategoryType.INFRASTRUCTURE)
                .description("Old description")
                .build();

        CreateCategoryDto dto = new CreateCategoryDto();
        dto.setName("Test Category"); // Same name
        dto.setType(CategoryType.ACCESSIBILITY);
        dto.setDescription("New description");

        when(categoryRepository.findById("c1")).thenReturn(Optional.of(existingCategory));
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        CategoryResponseDto result = categoryService.update("c1", dto);

        // Assert
        assertNotNull(result);
        assertEquals("New description", result.getDescription());
        verify(categoryRepository, never()).existsByName(anyString());
    }

    @Test
    void update_withExistingName_shouldThrowConflictException() {
        // Arrange
        Category existingCategory = Category.builder()
                .id("c1")
                .name("Old Name")
                .type(CategoryType.INFRASTRUCTURE)
                .build();

        CreateCategoryDto dto = new CreateCategoryDto();
        dto.setName("Existing Name");
        dto.setType(CategoryType.ACCESSIBILITY);

        when(categoryRepository.findById("c1")).thenReturn(Optional.of(existingCategory));
        when(categoryRepository.existsByName("Existing Name")).thenReturn(true);

        // Act & Assert
        assertThrows(ConflictException.class, () -> categoryService.update("c1", dto));
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void update_withNonExistentId_shouldThrowResourceNotFoundException() {
        // Arrange
        CreateCategoryDto dto = new CreateCategoryDto();
        dto.setName("New Name");
        dto.setType(CategoryType.ACCESSIBILITY);

        when(categoryRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> categoryService.update("nonexistent", dto));
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void delete_shouldDeleteCategory() {
        // Arrange
        when(categoryRepository.existsById("c1")).thenReturn(true);

        // Act
        categoryService.delete("c1");

        // Assert
        verify(categoryRepository, times(1)).existsById("c1");
        verify(categoryRepository, times(1)).deleteById("c1");
    }

    @Test
    void delete_withNonExistentId_shouldThrowResourceNotFoundException() {
        // Arrange
        when(categoryRepository.existsById("nonexistent")).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> categoryService.delete("nonexistent"));
        verify(categoryRepository, never()).deleteById(anyString());
    }
}
