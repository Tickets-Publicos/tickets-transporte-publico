package com.tickets.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickets.api.dto.category.CategoryResponseDto;
import com.tickets.api.dto.category.CreateCategoryDto;
import com.tickets.api.model.enums.CategoryType;
import com.tickets.api.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper mapper = new ObjectMapper();

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(categoryController).build();
    }

    @Test
    void create_shouldReturn201() throws Exception {
        CreateCategoryDto dto = new CreateCategoryDto();
        dto.setName("Test Category");
        dto.setType(CategoryType.INFRASTRUCTURE);
        dto.setDescription("Test description");

        CategoryResponseDto responseDto = new CategoryResponseDto();
        responseDto.setId("c1");
        responseDto.setName("Test Category");
        responseDto.setType(CategoryType.INFRASTRUCTURE);

        when(categoryService.create(any(CreateCategoryDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("c1"))
                .andExpect(jsonPath("$.name").value("Test Category"));

        verify(categoryService, times(1)).create(any(CreateCategoryDto.class));
    }

    @Test
    void findAll_shouldReturn200() throws Exception {
        CategoryResponseDto cat1 = new CategoryResponseDto();
        cat1.setId("c1");
        cat1.setName("Category 1");

        CategoryResponseDto cat2 = new CategoryResponseDto();
        cat2.setId("c2");
        cat2.setName("Category 2");

        when(categoryService.findAll()).thenReturn(Arrays.asList(cat1, cat2));

        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("c1"))
                .andExpect(jsonPath("$[1].id").value("c2"));

        verify(categoryService, times(1)).findAll();
    }

    @Test
    void findById_shouldReturn200() throws Exception {
        CategoryResponseDto responseDto = new CategoryResponseDto();
        responseDto.setId("c1");
        responseDto.setName("Test Category");

        when(categoryService.findById("c1")).thenReturn(responseDto);

        mockMvc.perform(get("/categories/c1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("c1"))
                .andExpect(jsonPath("$.name").value("Test Category"));

        verify(categoryService, times(1)).findById("c1");
    }

    @Test
    void update_shouldReturn200() throws Exception {
        CreateCategoryDto dto = new CreateCategoryDto();
        dto.setName("Updated Category");
        dto.setType(CategoryType.ACCESSIBILITY);

        CategoryResponseDto responseDto = new CategoryResponseDto();
        responseDto.setId("c1");
        responseDto.setName("Updated Category");

        when(categoryService.update(eq("c1"), any(CreateCategoryDto.class))).thenReturn(responseDto);

        mockMvc.perform(patch("/categories/c1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Category"));

        verify(categoryService, times(1)).update(eq("c1"), any(CreateCategoryDto.class));
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        doNothing().when(categoryService).delete("c1");

        mockMvc.perform(delete("/categories/c1"))
                .andExpect(status().isNoContent());

        verify(categoryService, times(1)).delete("c1");
    }
}
