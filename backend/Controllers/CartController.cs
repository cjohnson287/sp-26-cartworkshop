using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private const string CurrentUserId = "default-user";
    private readonly MarketplaceContext _context;

    public CartController(MarketplaceContext context)
    {
        _context = context;
    }

    // GET /api/cart
    [HttpGet]
    public async Task<ActionResult<CartResponse>> GetCart()
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart == null)
        {
            return NotFound(new { message = "Cart not found" });
        }

        var response = new CartResponse
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = cart.Items.Select(i => new CartItemResponse
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Price = i.Product.Price,
                ImageUrl = i.Product.ImageUrl,
                Quantity = i.Quantity,
                LineTotal = i.Product.Price * i.Quantity
            }).ToList(),
            TotalItems = cart.Items.Sum(i => i.Quantity),
            Subtotal = cart.Items.Sum(i => i.Product.Price * i.Quantity),
            Total = cart.Items.Sum(i => i.Product.Price * i.Quantity),
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt
        };

        return Ok(response);
    }

    // POST /api/cart
    [HttpPost]
    public async Task<ActionResult<CartItemResponse>> AddToCart([FromBody] AddToCartRequest request)
    {
        // Verify product exists
        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        // Find or create cart for CurrentUserId
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart == null)
        {
            cart = new Cart { UserId = CurrentUserId };
            _context.Carts.Add(cart);
        }

        // Check if CartItem for this productId already exists (upsert pattern)
        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

        if (existingItem != null)
        {
            // Increment quantity
            existingItem.Quantity += request.Quantity;
        }
        else
        {
            // Create new CartItem
            var cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };
            cart.Items.Add(cartItem);
        }

        // Update cart's UpdatedAt timestamp
        cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Get the item to return in response
        var itemToReturn = cart.Items.First(i => i.ProductId == request.ProductId);

        var itemResponse = new CartItemResponse
        {
            Id = itemToReturn.Id,
            ProductId = itemToReturn.ProductId,
            ProductName = product.Name,
            Price = product.Price,
            ImageUrl = product.ImageUrl,
            Quantity = itemToReturn.Quantity,
            LineTotal = product.Price * itemToReturn.Quantity
        };

        return CreatedAtAction(nameof(GetCart), itemResponse);
    }

    // PUT /api/cart/{cartItemId}
    [HttpPut("{cartItemId}")]
    public async Task<ActionResult<CartItemResponse>> UpdateCartItem(
        int cartItemId,
        [FromBody] UpdateCartItemRequest request)
    {
        var cartItem = await _context.CartItems
            .Include(i => i.Cart)
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == cartItemId);

        if (cartItem == null)
        {
            return NotFound(new { message = "Cart item not found" });
        }

        // Verify ownership
        if (cartItem.Cart.UserId != CurrentUserId)
        {
            return Forbid();
        }

        // Update quantity
        cartItem.Quantity = request.Quantity;

        // Update cart's UpdatedAt timestamp
        cartItem.Cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = new CartItemResponse
        {
            Id = cartItem.Id,
            ProductId = cartItem.ProductId,
            ProductName = cartItem.Product.Name,
            Price = cartItem.Product.Price,
            ImageUrl = cartItem.Product.ImageUrl,
            Quantity = cartItem.Quantity,
            LineTotal = cartItem.Product.Price * cartItem.Quantity
        };

        return Ok(response);
    }

    // DELETE /api/cart/{cartItemId:int}
    [HttpDelete("{cartItemId:int}")]
    public async Task<IActionResult> RemoveFromCart(int cartItemId)
    {
        var cartItem = await _context.CartItems
            .Include(i => i.Cart)
            .FirstOrDefaultAsync(i => i.Id == cartItemId);

        if (cartItem == null)
        {
            return NotFound(new { message = "Cart item not found" });
        }

        // Verify ownership
        if (cartItem.Cart.UserId != CurrentUserId)
        {
            return Forbid();
        }

        // Remove the CartItem
        _context.CartItems.Remove(cartItem);

        // Update cart's UpdatedAt timestamp
        cartItem.Cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/cart/clear
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart == null)
        {
            return NotFound(new { message = "Cart not found" });
        }

        // Remove all CartItems
        _context.CartItems.RemoveRange(cart.Items);

        // Update cart's UpdatedAt timestamp
        cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}