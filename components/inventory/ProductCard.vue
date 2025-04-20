<template>
  <div class="product-card" :class="{ 'low-stock': isLowStock }">
    <div class="product-image" :style="{ 'background-color': getColorByCategory }">
      <span class="product-icon">{{ getCategoryIcon }}</span>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-details">
        <div class="detail-row">
          <span class="detail-label">Код:</span>
          <span class="detail-value">{{ product.code }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Категория:</span>
          <span class="detail-value">{{ product.category }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">В наличии:</span>
          <span class="detail-value" :class="{ 'text-danger': isLowStock }">
            {{ product.quantity }} {{ product.unit }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Цена:</span>
          <span class="detail-value">{{ product.price.toLocaleString() }} ₽</span>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn-icon" @click="$emit('edit', product)">
          <span class="icon">✏️</span>
        </button>
        <button class="btn-icon" @click="$emit('view', product)">
          <span class="icon">👁️</span>
        </button>
        <button class="btn-icon" @click="$emit('delete', product)">
          <span class="icon">🗑️</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

defineEmits(['edit', 'view', 'delete']);

// Проверяем, низкий ли остаток товара
const isLowStock = computed(() => {
  return props.product.quantity <= props.product.minQuantity;
});

// Получаем иконку в зависимости от категории
const getCategoryIcon = computed(() => {
  const category = props.product.category.toLowerCase();
  
  if (category.includes('электроника')) return '💻';
  if (category.includes('мебель')) return '🪑';
  if (category.includes('канцтовары')) return '📝';
  if (category.includes('запчасти')) return '🔧';
  
  return '📦'; // Значение по умолчанию
});

// Получаем цвет фона в зависимости от категории
const getColorByCategory = computed(() => {
  const category = props.product.category.toLowerCase();
  
  if (category.includes('электроника')) return '#3b82f6';
  if (category.includes('мебель')) return '#10b981';
  if (category.includes('канцтовары')) return '#f59e0b';
  if (category.includes('запчасти')) return '#8b5cf6';
  
  return '#6b7280'; // Значение по умолчанию
});
</script>

<style lang="scss" scoped>
.product-card {
  display: flex;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  &.low-stock {
    border-left: 4px solid var(--error-color);
  }
}

.product-image {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.product-icon {
  font-size: 2.5rem;
}

.product-info {
  flex: 1;
  padding: 1rem;
  position: relative;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.product-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.detail-label {
  color: #6b7280;
  margin-right: 0.5rem;
}

.detail-value {
  font-weight: 500;
  color: var(--text-color);
  
  &.text-danger {
    color: var(--error-color);
  }
}

.product-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  .icon {
    font-size: 1.25rem;
  }
}

@media (max-width: 640px) {
  .product-card {
    flex-direction: column;
  }
  
  .product-image {
    width: 100%;
    height: 100px;
  }
  
  .product-details {
    grid-template-columns: 1fr;
  }
}
</style> 